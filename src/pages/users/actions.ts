import {createUser, deleteUser, User} from "../../shared/users-api.ts";
import {use} from "react";

// "инишлстейт"
type CreateActionState = {
  error?: string
  email: string
}

export type CreateUserAction = (
  state: CreateActionState,
  formData: FormData
) => Promise<CreateActionState>;

// "Чтобы убрать всю логику из компонента и сделать неуправляемую форму"
// ====================================================================
// "Экшен" - "асинк" фнкция которая делает переходы, функция для транзишенов. Можно сделать как "АС" а можно нет
// принимает старый "стеит" и возвращ.новый "actionState" - "функция перехода из предыдущего состояния в новое"
// вторым аргументом принимает параметры с которыми будем его вызывать (у нас "formData")
export const createUserAction = ({refetchUsers, optimisticCreate}: { refetchUsers: () => void, optimisticCreate: (user: User) => void }): CreateUserAction =>
  async (prevState: CreateActionState, formData: FormData) => {
    const email = formData.get("email") as string; // получили из инпута

    // валидация формы
    if (email === "admin@gmail.com") {
      return {
        error: "Admin account is not allowed",
        email // в случае ошибки отображаем email из FormData
      };
    }

    try {
      const user = {
        id: crypto.randomUUID(), // генерим id
        email
      };
      optimisticCreate(user); // перед созданием юзера
      await createUser((user));
      // кнопка "раздизеиблится" уберется дефолтное значение только тогда когда в список в "лишку" добавился новый элемент
      // а добавился он тогда когда произошел post запрос потом get за юзерами - без РТК квери - не надо "тэги"
      // startTransition - тк асинхронная и долгая операция оборачиваем всегда в "транзишн" === перезапрос, обновление данных
      // после создания юзера запрашиваем данные только === "ревалидация данных"
      // === post(создали юзера) + get(список новый юзеров)
      refetchUsers(); // обернут в обёртку в startTransition в фале page: const refetchUsers = () => startTransition(() => setUsersPromise(fetchUsers()));

      // если все "ок" (форма отправляется) - вернем состояние "экшена"
      return {
        email: "" // зануляем текст инпута в случае успешной отправи формы (создания нового юзера)
      };
    } catch (error) {
// в случае ошибки "при отправке формы" - вернем:
      return {
        // error: (error as Error).message
        error: "Error while creating user",
        email // в случ.ошибки не стираем инпут
      };
    }
  };
// -----------------------------------------------
// "инишлстейт"
type DeleteUserActionState = {
  error?: string
}
export type DeleteUserAction = (
  state: DeleteUserActionState,
  formData: FormData
) => Promise<DeleteUserActionState>;

export const deleteUserAction = ({refetchUsers, optimisticDelete}: { refetchUsers: () => void, optimisticDelete: (id: string) => void }): DeleteUserAction =>
  async (state: DeleteUserActionState, formData: FormData) => {
    const id = formData.get("id") as string;

    try {
      optimisticDelete(id)
      await deleteUser(id);
      refetchUsers();

      return {};
    } catch { // в новом JS (error) - не обязателен
      return {
        error: "Error on Deleting"
      };
    }

  };

/*
- Обработка ошибок + валидация формы
 */
