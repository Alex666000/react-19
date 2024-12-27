import {useState, startTransition, useOptimistic, use} from "react";
import {fetchUsers, User} from "../../shared/users-api.ts";
import {createUserAction, deleteUserAction} from "./actions.ts";

// !! так теперь "если нет параметров" - "запрос на сервер" можно делать вмето "эффекта" + use():
const defaultUsersPromise = fetchUsers();

export const useUsers = () => {
  const [usersPromise, setUsersPromise] = useState(defaultUsersPromise);

  // обновляем данные и они снова попадают в UsersList - делаем загрузку но ее "неэвейтим" а просто "сетаем" в промис
  // тут появляется новыи промис и он попадает в UsersList и снова "активирует" Suspense
  // "ревалидация данных === после например "post" запроса - делаем "get" запрос" и обновляем "UX"
  const refetchUsers = () => startTransition(() => setUsersPromise(fetchUsers())); /* startTransition(() - можно использ.и без хука - он возьмется из Реакта сам... */

  // "Оптимистик на список"
  const [createdUsers, optimisticCreate] = useOptimistic([] as User[], (createdUsers, user: User) => [...createdUsers, user]);
  const [deletedUsersIds, optimisticDelete] = useOptimistic([] as string[], (deletedUsers, id: string) => deletedUsers.concat(id));

  const useUsersList = () => {
    const users = use(usersPromise);

    return users
      .concat(createdUsers)
      .filter((user) => !deletedUsersIds.includes(user.id));
  };

  return {
    createUserAction: createUserAction({refetchUsers, optimisticCreate}),
    deleteUserAction: deleteUserAction({refetchUsers, optimisticDelete}),
    useUsersList
  } as const;
};

