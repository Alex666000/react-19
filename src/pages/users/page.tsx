import {Suspense, use, useActionState, useOptimistic, useRef} from "react";
import {User} from "../../shared/api.ts";
import {ErrorBoundary} from "react-error-boundary";
import {CreateUserAction, DeleteUserAction} from "./actions.ts";
import {useUsers} from "./use-users.ts";

export const UsersPage = () => {
  const {useUsersList, createUserAction, deleteUserAction, usersPromise,} = useUsers();

  return (
    <main className="container mx-auto p-4 pt-10 flex flex-col gap-4">
      <h1 className="text-3xl font-bold underline mb-10">Users</h1>
      {/* Форма создания юзера */}
      <CreateUserForm
        createUserAction={createUserAction}
      />
      {/* Ошибка: нет сети или сервера*/}
      <ErrorBoundary fallbackRender={(error) => (
        <div className="text-red-500">
          Something went wrong:{JSON.stringify(error)}
        </div>
      ) as any}>
        <Suspense fallback={<div>Loading...</div>}>
          <UsersList
            useUsersList={useUsersList}
            deleteUserAction={deleteUserAction}/>
        </Suspense>
      </ErrorBoundary>
    </main>
  );
};

// "Обновление данных как на реакт 19" - 26 мин (https://www.youtube.com/watch?v=eAlYtiKQsV8) - принимаем функцию для рефетча
const CreateUserForm = ({createUserAction}: { createUserAction: CreateUserAction }) => {
  // полная интеграция с неуправляемыми формами useActionState
  const [state, dispatch,] = useActionState(createUserAction, {email: ""}); // дефолтное значение инпута: email: ''

  const [optimisticState, setOptimisticState] = useOptimistic(state);

  const form = useRef<HTMLFormElement>(null);

  return (
    <form
      className="flex gap-2"
      ref={form}
      action={(formData: FormData) => {
        form.current?.reset()
        setOptimisticState({email: ""});
        dispatch(formData);
      }}>
      <input
        // чтобы работала "неуправляемая форма" надо "name" указать обязательно
        name="email"
        defaultValue={optimisticState.email} // для неуправляемой формы
        className="borser p-2 rounded bg-gray-100"
        type="email"
        // когда идет запрос "дизеиблим" "инпут"
      />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500">
        Add
      </button>
      {optimisticState.error && <div className="text-red-500">{optimisticState.error}</div>}
    </form>
  );
};

export const UsersList = ({deleteUserAction, useUsersList}: {
  deleteUserAction: DeleteUserAction, useUsersList: () => User[]
}) => {
  // "use" - прямо в рендере превратить наш Promise<User[]> в "юзеров",
  const users = useUsersList();

  return (
    <ul className="flex flex-col">
      {users.length ? users.map((user) => {
        return (
          <UserCard
            key={user.id}
            user={user}
            deleteUserAction={deleteUserAction}
          />
        );
      }) : null}
    </ul>
  );
};

export function UserCard({user, deleteUserAction,}: { user: User; deleteUserAction: DeleteUserAction }) {
  const [state, handleDelete] = useActionState(deleteUserAction, {});

  return (
    <div className="border p-2 m-2 rounded bg-gray-100 flex gap-2">
      {user.email}

      <form className="ml-auto">
        <input type="hidden" name="id" value={user.id}/> {/* "hidden" - чтобы id передать в deleteUserAction */}
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-auto disabled:bg-gray-400"
          // type="button" // убрали тип тк отправляем форму
          formAction={handleDelete}
        >
          Delete
          {state.error && <div className="text-red-500">{state.error}</div>}
        </button>
      </form>
    </div>
  );
}

/*
https://www.youtube.com/watch?v=eAlYtiKQsV8
- use - Без "юзэфектов" все красиво в одну строчку + "Лоадинг", "use" то место которое использкем через "use"
обязаны обернуть в "Suspence", работают вмсете, "use" достает данные из промиса а "Саспенс" чтобы показать состояние загрузки
- Обновление ("refetch()" ) данных как на реакт 19 - 26 мин - принимаем функцию для "рефетча"
- useImperativeHandle для "ресета" формы и получаем немного контроля для неуправляемой формой + доступ ко всем методом родки (Паромов)
Также его использовать чтобы вызвать метод дочернего неуправляемого компонента в родителе: 11 https://www.youtube.com/watch?v=ZBtU9lxgztI&t=2s
-  "useTransition" не показывать "лоадер" пока идет запрос а показывать старых юзеров. В "долгое", запрос на сервер "всегда оборачиваем в startTransition" -
показывать старые данные пока не произойдет ревалидация "refetch()" = 2 запроса: сначала post + get
"транзишн" - когда "долгие" обновления (запрос данных, переходы м.у страницами, открытие модалки - юзеру не так важно чтобы это было быстро)
реакт "приоритизирует" - транзишены отображаются чуть позже чем важные быстрые обновления - типа что юзер ввел в инпут - увеличиваем "UX"
"Главное": в "транзишене" можем делать "асинхронныи запрос" - если открытие модалки долгое то можем в процессе закрытия модалки сделать запрос
на данные из этои модалки - после того как запрос прошел - открываем модалку...
Правило: "ЕСЛИ НУЖНО ЧТО-ТО ДОЛГОЕ И АСИНХРОННОЕ - ВСЕГДА ОБОРАЧИВАЕМ В "ТРАНЗИШН", сначала выполнит первоочередное короткое
деиствие юзера (setEmail('') короткое к примеру), наиболее важное - потом ДОЛГОЕ"
- "Пессимистический апдейт" — это подход к обновлению состояния, при котором обновление пользовательского интерфейса (UI) происходит только после успешного
 выполнения запроса на сервер. То есть приложение сначала делает запрос, ждёт ответа от сервера, а затем обновляет состояние и UI на основе
этого ответа.Этот подход считается более надёжным, так как данные в UI всегда отражают текущее состояние
на сервере. Однако он может делать взаимодействие с приложением менее отзывчивым, так как пользователь видит
изменения только после завершения запроса.
- "Оптимистический апдейт" - когда имитируем что с интерфеисом все замечательно - нажали на удалить и удалилось раньше чем запрос на сервер прошел + нет
 лоадеров, а если ошибка то все вернется назад. С "лайками" и "удалениями, добавление юзера" часто делают оптимистики. Проверяем 1.12.00 делаем низкую
  скорость интернета
- ErrorBoundary (когда нет сети и сервак отвалился) - вокруг компонента обернем "UserLists" - когда нет сети
вместо него текст покажем
- у неуправляемых форм доступность лучше - "полная интеграция с неуправляемыми формами useActionState"
Если форму можно сделать неуправляемои делать ее "неуправляемой"
- useActionState() - чтобы обработать ошибки формы(валидация) + с неуправляемой формой(доступность и перфоманс лучше) + вся логика вынесена за пределы
 компонента - хук используем для создания и удаления юзера
 */
