export class RequestError extends Error {
  constructor(status, fields = {}) {
    super('HTTP ' + status);
    this.status = status;
    this.fields = fields;
  }
}

export function requestMessage(error) {
  if (error.status === 401) return 'Для этого действия войдите в аккаунт. После входа обновите данные аккаунта.';
  if (error.status === 403) return 'Недостаточно прав для этого действия.';
  if ([400, 422].includes(error.status)) return 'Проверьте заполнение полей формы.';
  if (error.status === 429) return 'Слишком много запросов. Повторите немного позже.';
  if (error.status >= 500) return 'Сервер временно недоступен. Попробуйте позже.';
  return 'Не удалось выполнить запрос. Проверьте подключение и повторите попытку.';
}
