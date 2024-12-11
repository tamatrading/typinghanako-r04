const DEBUG = import.meta.env.DEV;

interface DebugStyle {
  label: string;
  color: string;
  background?: string;
}

const styles: Record<string, DebugStyle> = {
  state: {
    label: 'State',
    color: '#fff',
    background: '#2563eb'
  },
  props: {
    label: 'Props',
    color: '#fff',
    background: '#16a34a'
  },
  error: {
    label: 'Error',
    color: '#fff',
    background: '#dc2626'
  },
  lifecycle: {
    label: 'Lifecycle',
    color: '#fff',
    background: '#7c3aed'
  }
};

export const debug = {
  log: (type: keyof typeof styles, message: string, data?: any) => {
    if (!DEBUG) return;

    const style = styles[type];
    const timestamp = new Date().toLocaleTimeString();

    console.log(
      `%c ${style.label} %c ${timestamp} %c ${message}`,
      `background: ${style.background}; color: ${style.color}; padding: 2px 6px; border-radius: 3px 0 0 3px;`,
      'background: #666; color: #fff; padding: 2px 6px;',
      'background: transparent; color: #666; padding: 2px 0;',
      data || ''
    );
  },

  state: (message: string, data?: any) => debug.log('state', message, data),
  props: (message: string, data?: any) => debug.log('props', message, data),
  error: (message: string, data?: any) => debug.log('error', message, data),
  lifecycle: (message: string, data?: any) => debug.log('lifecycle', message, data)
};

// 開発環境でのみグローバルに利用可能にする
if (DEBUG) {
  (window as any).debug = debug;
}