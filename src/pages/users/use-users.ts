import {useState, startTransition} from "react";
import {fetchUsers} from "../../shared/api";

// !! так теперь "если нет параметров" - "запрос на сервер" можно делать вмето "эффекта" + use():
const defaultUsersPromise = fetchUsers();

export const useUsers = () => {
  const [usersPromise, setUsersPromise] = useState(defaultUsersPromise);

  // "ревалидация данных === после например "post" запроса - делаем "get" запрос" и обновляем "UX"
  const refetchUsers = () => startTransition(() => setUsersPromise(fetchUsers())); /* startTransition(() - можно использ.и без хука - он возьмется из Реакта сам... */

  return [usersPromise, refetchUsers] as const
};

