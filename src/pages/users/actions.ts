type CreateActionState = {}

// Экшен - асинк фнкция которая делает переходы, функция для транзишенов. Можно сделать как "АС"
// принимает старый стеит и возвращ.новый - "функция перехода из предыдущего состояния в новое"
// вторым аргументом принимает параметры с которыми будем ео вызывать
export const createUserAction = () =>
  async (prevState: CreateActionState, formData: { email: string }): Promise<CreateActionState> => {

  };
