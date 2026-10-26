import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Toast from '../components/ui/Toast';

const ToastContext = createContext(null);
const TOAST_DURATION = 3500;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type, message) => {
      const id = Date.now() + Math.random();
      setToasts((list) => [...list, { id, type, message }]);
      setTimeout(() => remove(id), TOAST_DURATION);
    },
    [remove],
  );

  const toast = useMemo(
    () => ({
      success: (message) => show('success', message),
      error: (message) => show('error', message),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div aria-live="polite" className="fixed right-4 bottom-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} type={t.type} message={t.message} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
