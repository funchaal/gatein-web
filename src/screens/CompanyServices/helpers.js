export const extractErrorMessage = (err, defaultMsg = 'Erro inesperado.') => {
  if (!err) return defaultMsg;

  let data = err.data || err.response?.data || err;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch (e) { /* ignore */ }
  }

  if (data?.detail?.message) return data.detail.message;
  if (typeof data?.detail === 'string') return data.detail;
  if (data?.message) return data.message;
  if (data?.error?.message) return data.error.message;
  if (typeof data?.error === 'string') return data.error;
  if (Array.isArray(data?.detail) && data.detail[0]?.msg) return data.detail[0].msg;

  if (err.message) return err.message;
  
  return defaultMsg;
};
