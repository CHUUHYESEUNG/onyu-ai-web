/**
 * AudioRecorder - 브라우저 음성 녹음 유틸리티
 *
 * MediaRecorder API를 래핑하여 크로스 브라우저 호환성과
 * 시니어 친화적 UX를 제공합니다.
 *
 * 지원 브라우저:
 * - Chrome/Edge: WebM (Opus)
 * - Safari (Mac/iOS): MP4 (AAC)
 * - Firefox: WebM (Opus)
 */

export interface AudioRecorderOptions {
  /**
   * 오디오 비트레이트 (기본: 64000 = 64kbps)
   * - 32000: 저품질 (2.4MB/10분)
   * - 64000: 중품질 (4.8MB/10분) ✅ 추천
   * - 128000: 고품질 (9.6MB/10분)
   */
  audioBitsPerSecond?: number;

  /**
   * 샘플레이트 (기본: 44100 = CD 품질)
   */
  sampleRate?: number;

  /**
   * 에코 제거 활성화 (기본: true)
   */
  echoCancellation?: boolean;

  /**
   * 노이즈 억제 활성화 (기본: true)
   */
  noiseSuppression?: boolean;

  /**
   * 자동 게인 제어 (기본: true)
   */
  autoGainControl?: boolean;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private pausedDuration: number = 0;
  private pauseStartTime: number = 0;

  private options: Required<AudioRecorderOptions> = {
    audioBitsPerSecond: 64000,
    sampleRate: 44100,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  };

  constructor(options?: AudioRecorderOptions) {
    if (options) {
      this.options = { ...this.options, ...options };
    }
  }

  /**
   * 마이크 권한 요청 및 미디어 스트림 획득
   *
   * @throws {Error} 권한이 거부되거나 마이크를 사용할 수 없는 경우
   */
  async requestPermission(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: this.options.echoCancellation,
          noiseSuppression: this.options.noiseSuppression,
          autoGainControl: this.options.autoGainControl,
          sampleRate: this.options.sampleRate,
        },
      });
    } catch (error) {
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          throw new Error('마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
        } else if (error.name === 'NotFoundError') {
          throw new Error('마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.');
        } else if (error.name === 'NotReadableError') {
          throw new Error('마이크를 사용할 수 없습니다. 다른 프로그램에서 사용 중일 수 있습니다.');
        }
      }
      throw new Error('마이크 접근에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  /**
   * 녹음 시작
   *
   * Safari 호환을 위해 MP4를 우선 지원하고, 폴백으로 WebM 사용
   *
   * @throws {Error} 스트림이 없거나 이미 녹음 중인 경우
   */
  start(): void {
    if (!this.stream) {
      throw new Error('먼저 requestPermission()을 호출하여 마이크 권한을 요청하세요.');
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      throw new Error('이미 녹음 중입니다.');
    }

    // Safari 호환: MP4 우선, WebM 폴백
    const mimeType = this.getSupportedMimeType();

    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType,
      audioBitsPerSecond: this.options.audioBitsPerSecond,
    });

    // 데이터 수집 (1초마다)
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    // 에러 처리
    this.mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event);
      this.cleanup();
    };

    this.audioChunks = [];
    this.startTime = Date.now();
    this.pausedDuration = 0;
    this.mediaRecorder.start(1000); // 1초마다 데이터 수집
  }

  /**
   * 녹음 일시정지
   */
  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.pauseStartTime = Date.now();
    }
  }

  /**
   * 녹음 재개
   */
  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.pausedDuration += Date.now() - this.pauseStartTime;
      this.mediaRecorder.resume();
    }
  }

  /**
   * 녹음 정지 및 오디오 Blob 반환
   *
   * @returns 녹음된 오디오 Blob
   */
  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('녹음이 시작되지 않았습니다.'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder!.mimeType;
        const blob = new Blob(this.audioChunks, { type: mimeType });

        this.cleanup();
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * 현재 녹음 시간 (초 단위)
   */
  getRecordingDuration(): number {
    if (!this.startTime) return 0;

    const now = Date.now();
    const elapsed = now - this.startTime - this.pausedDuration;

    // 일시정지 중이면 일시정지 시간 제외
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      return Math.floor((elapsed - (now - this.pauseStartTime)) / 1000);
    }

    return Math.floor(elapsed / 1000);
  }

  /**
   * 현재 녹음 상태
   */
  getState(): 'inactive' | 'recording' | 'paused' {
    return this.mediaRecorder?.state || 'inactive';
  }

  /**
   * 브라우저에서 지원하는 MIME 타입 확인
   *
   * Safari: MP4 (AAC)
   * Chrome/Firefox/Edge: WebM (Opus)
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus', // Chrome, Firefox, Edge
      'audio/webm', // WebM 일반
      'audio/mp4', // Safari
      'audio/ogg;codecs=opus', // Firefox 폴백
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    // 모든 타입이 지원되지 않으면 빈 문자열 (브라우저 기본값 사용)
    return '';
  }

  /**
   * 리소스 정리
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.audioChunks = [];
    this.startTime = 0;
    this.pausedDuration = 0;
    this.pauseStartTime = 0;
  }

  /**
   * 수동으로 리소스 정리
   * (컴포넌트 언마운트 시 호출)
   */
  dispose(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }
}

/**
 * 브라우저가 MediaRecorder API를 지원하는지 확인
 */
export function isMediaRecorderSupported(): boolean {
  return typeof window !== 'undefined' && 'MediaRecorder' in window;
}

/**
 * 브라우저가 getUserMedia를 지원하는지 확인
 */
export function isGetUserMediaSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  );
}

/**
 * 오디오 녹음이 가능한 환경인지 확인
 */
export function isAudioRecordingSupported(): boolean {
  return isMediaRecorderSupported() && isGetUserMediaSupported();
}
