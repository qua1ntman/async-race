import { ICarObj, IWinnerObj } from './DataIntarfaces';

const url = 'https://secure-island-83297.herokuapp.com';

export async function getCars(page: number): Promise<ICarObj[]> {
  const data: Response = await fetch(`${url}/garage?_page=${page}&_limit=7`);
  const responce: ICarObj[] = await data.json();
  return responce;
}

export async function getCarsNumber(): Promise<number> {
  const data: Response = await fetch(`${url}/garage`);
  const responce: ICarObj[] = await data.json();
  return responce.length;
}

export async function getWinners(page: number): Promise<IWinnerObj[]> {
  const data: Response = await fetch(`${url}/winners?_page=${page}&_limit=7`);
  const responce: IWinnerObj[] = await data.json();
  return responce;
}

export async function getWinnersNumber(): Promise<number> {
  const data: Response = await fetch(`${url}/winners`);
  const responce: IWinnerObj[] = await data.json();
  return responce.length;
}

export async function addWinner({ id, time }: { id: number, time: number }): Promise<ICarObj> {
  const winners: Response = await fetch(`${url}/winners`);
  const wResponce: IWinnerObj[] = await winners.json();
  const sameCar = wResponce.find((item) => item.id === id);
  if (sameCar) {
    const data: Response = await fetch(`${url}/winners/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({ time, wins: sameCar.wins + 1 } ),
    });
    const responce: ICarObj = await data.json();
    return responce;
  } else {
    const data: Response = await fetch(`${url}/winners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({ id, time, wins: 1 }),
    });
    const responce: ICarObj = await data.json();
    return responce;
  }

}

export async function getCar(id: number): Promise<ICarObj> {
  const data: Response = await fetch(`${url}/garage/${id}`);
  const responce: ICarObj = await data.json();
  return responce;
}

export async function addCar(car: ICarObj): Promise<ICarObj> {
  const data: Response = await fetch(`${url}/garage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(car),
  });
  const responce: ICarObj = await data.json();
  return responce;
}

export async function editCar(car: ICarObj): Promise<ICarObj> {
  const { id, ...rest } = car;
  const data: Response = await fetch(`${url}/garage/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(rest ),
  });
  const responce: ICarObj = await data.json();
  return responce;
}

export async function deleteCar(id: number): Promise<ICarObj> {
  const data: Response = await fetch(`${url}/garage/${id}`, { method: 'DELETE' });
  const responce: ICarObj = await data.json();
  const data2: Response = await fetch(`${url}/winners/${id}`, { method: 'DELETE' });
  await data2.json();
  return responce;
}

export async function engineSwitch(id: number, engine: string) {
  const data: Response = await fetch(`${url}/engine?id=${id}&status=${engine}`, { method: 'PATCH' });
  const responce = await data.json();
  return responce;
}

export async function engineDrive(id: number): Promise<string | { success: string; }> {
  const data: Response = await fetch(`${url}/engine?id=${id}&status=drive`, { method: 'PATCH' });
  try {
    const responce = await data.json();
    return responce;
  } catch (e) {
    if (e instanceof Error) return e.message;
    else return 'Uncought error: ' + e;
  }
}
