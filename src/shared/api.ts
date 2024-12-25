export type User = {
  id: string
  email: string
}

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const res = await fetch("http://localhost:3001/users");
    if (!res.ok) throw new Error(`Failed with status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(error);
  }
};

export const createUser = async (user: User): Promise<User> => {
  try {
    const res = await fetch("http://localhost:3001/users", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(user)
    });
    if (!res.ok) throw new Error(`Failed with status ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(error);
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const res = await fetch(`http://localhost:3001/users/${userId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`Failed with status ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(error);
  }
};
