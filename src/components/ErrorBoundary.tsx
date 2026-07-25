import React from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error in React tree:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h1 className="text-xl font-bold text-slate-100 mb-2">
            页面加载遇到轻微异常
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
            检测到当前移动端浏览器兼容性或本地缓存异常 ({this.state.error?.message || '渲染错误'})，点击下方按钮即可一键恢复。
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={this.handleReload}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>重新加载网页</span>
            </button>

            <button
              onClick={this.handleReset}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>重置本地缓存并重试</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
