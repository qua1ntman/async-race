import { ICarObj, IWinnerObj } from './DataIntarfaces';

const url = 'https://secure-island-83297.herokuapp.com';

export async function getCars(): Promise<ICarObj[]> {
  const data: Response = await fetch(`${url}/garage`);
  const responce: ICarObj[] = await data.json();
  return responce;
}

export async function getWinners(): Promise<IWinnerObj[]> {
  const data: Response = await fetch(`${url}/winners`);
  const responce: IWinnerObj[] = await data.json();
  return responce;
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

export async function getCar(id: number ): Promise<ICarObj> {
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

export async function deleteCar(id: number ): Promise<ICarObj> {
  const data: Response = await fetch(`${url}/garage/${id}`, { method: 'DELETE' });
  const responce: ICarObj = await data.json();
  fetch(`${url}/winners/${id}`, { method: 'DELETE' });
  return responce;
}

export async function clearDataBase(): Promise<any> {
  const data: Response = await fetch(`${url}/garage`);
  const responce: ICarObj[] = await data.json();
  for (let i = 0; i < responce.length; i++) {
    fetch(`${url}/garage/${responce[i].id}`, { method: 'DELETE' });
    fetch(`${url}/winners/${responce[i].id}`, { method: 'DELETE' });
  }
  return responce;
}

export async function engineSwitch(id: number, engine: string) {
  const data: Response = await fetch(`${url}/engine?id=${id}&status=${engine}`, { method: 'PATCH' });
  const responce = await data.json();
  return responce;
}

export async function engineDrive(id: number ): Promise<string | { success: string; }> {
  const data: Response = await fetch(`${url}/engine?id=${id}&status=drive`, { method: 'PATCH' });
  try {
    const responce = await data.json();
    return responce;
  } catch (e) {
    if (e instanceof Error) return e.message;
    else return 'Uncought error: ' + e;
  }
}
