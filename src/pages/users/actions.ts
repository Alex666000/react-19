import {createUser} from "../../shared/api.ts";

type CreateActionState = {
  error?: string
}

// "Чтобы убрать всю логику из компонента и сделать неуправляемую форму"

// Экшен - асинк фнкция которая делает переходы, функция для транзишенов. Можно сделать как "АС"
// принимает старый стеит и возвращ.новый "actionState" - "функция перехода из предыдущего состояния в новое"
// вторым аргументом принимает параметры с которыми будем ео вызывать
export const createUserAction = ({refetchUsers}: { refetchUsers: () => void }) =>
  async (prevState: CreateActionState, formData: FormData): Promise<CreateActionState> => {
    const email = formData.get("email") as string;

    // валидация формы
    if (email === "admin@gmail.com") {
      return {
        error: "Admin account is not allowed",
      };
    }

    try {
      await createUser({
        id: crypto.randomUUID(),
        email
      });
      // кнопка раздизеиблится уберется дефолтное значение только тогда когда в список "лишку" добавился новый элемент
      // а добавился он тогда когда произошел post запрос потом get за юзерами - без РТК квери - не надо "тэги"
      // startTransition - тк асинхронная и долгая операция оборачиваем всегда в "транзишн" === перезапрос, обновление данных
      // после создания юзера запрашиваем данные только === "ревалидация данных"
      // === post(создали юзера) + get(список новый юзеров)
      refetchUsers();

      // если все ок - вернем состояние экшена
      return {};
    } catch (error) {
// в случае ошибки вернем:
      return {
        // error: (error as Error).message
        error: "Error while creating user"
      };
    }
  };

/*
- Обработка ошибок + валидация формы
 */
