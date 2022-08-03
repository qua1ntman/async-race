import { addCar, addWinner, deleteCar, editCar, engineDrive, engineSwitch, getCars } from '../../Queries';
import { calculateDistance, getRandomColor, tagGenerator } from '../../helpers';
import './Main.scss';
import { ICarObj } from './../../DataIntarfaces';
import { carSvg } from '../../carSvg';
import { carData } from '../../carNameData';
import { Winners } from '../Winners/Winners';

export class Main {

  allCars: ICarObj[] = [];

  winners: Winners = new Winners();

  selectedId: number  = 0;

  currPage: number = 1;

  mainPage = tagGenerator('section', 'cars-section', 'cars_page') as HTMLBaseElement;
  
  upperTable = tagGenerator('div', 'upper-table') as HTMLDivElement;
  
  carWon: { id: number, time: number } = { id: 0, time: 100000 };

  carsRaceData: [number, HTMLElement, HTMLElement, number, number, number][] = [];

  async createMainSection(): Promise<void> {
    this.allCars = await getCars();
    this.winners.allCars = this.allCars;
    this.createActionBlock();
    await this.createCarTable();
    this.mainPage.appendChild(this.upperTable);
    document.getElementById('main')?.appendChild(this.mainPage);
  }

  createActionBlock(): void {
    const setUpDiv = tagGenerator('div', 'action-container') as HTMLDivElement;

    const createForm = tagGenerator('form', 'set-up-row', 'create_form') as HTMLFormElement;
    const updateForm = tagGenerator('form', 'set-up-row', 'update_form') as HTMLFormElement;
    const actionBtnsDiv = tagGenerator('div', 'set-up-row') as HTMLDivElement;
    

    const createFormName = tagGenerator('input', 'car-name-input', 'create_name') as HTMLInputElement;
    createFormName.setAttribute('autocomplete', 'off');
    const createFormColor = tagGenerator('input', 'car-color-input', 'create_color') as HTMLInputElement;
    createFormColor.type = 'color';
    const createBtn = tagGenerator('button', 'btn', 'create_btn') as HTMLButtonElement;
    createBtn.classList.add('green-btn');
    createBtn.innerText = 'Create';
    const errorDiv = tagGenerator('div', 'error-create') as HTMLDivElement;

    createBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (createFormName.value === '') {
        createFormName.setAttribute('placeholder', 'There is no data (ᗒᗣᗕ)՞');
        createFormName.classList.add('red-placeholder');
        setTimeout(() => {
          createFormName.removeAttribute('placeholder');
          createFormName.classList.remove('red-placeholder');
        }, 2000);
      } else {
        const data: ICarObj = {
          id: Math.floor(Math.random() * 10000000),
          name: createFormName.value,
          color: createFormColor.value,
        };
        console.log(data);
        
        await addCar(data);
        createFormName.value = '';
        createFormColor.value = '#000000';
        this.allCars.push(data);
        const createdCar = this.createCarRow(data);
        if (this.allCars.length - 1 < 7 * (this.currPage - 1) || this.allCars.length - 1 > 6 + 7 * (this.currPage - 1)) {
          createdCar.classList.add('hide');
          const nextBtn = document.getElementById('next_main_btn') as HTMLButtonElement;
          nextBtn.disabled = false;
        }  
        document.getElementById('cars_table')!.appendChild(createdCar);
        const tableName = document.getElementById('table_name') as HTMLHeadingElement;
        tableName.innerText = `Garage(${this.allCars.length})`;
      }
    });
    
    [createFormName, createFormColor, createBtn, errorDiv].forEach(item => createForm.appendChild(item));
    
    const updateFormName = tagGenerator('input', 'car-name-input', 'update_name') as HTMLInputElement;
    updateFormName.setAttribute('autocomplete', 'off');
    const updateFormColor = tagGenerator('input', 'car-color-input', 'update_color') as HTMLInputElement;
    updateFormColor.type = 'color';
    const updateBtn = tagGenerator('button', 'btn', 'update_btn') as HTMLButtonElement;
    updateBtn.classList.add('green-btn');
    updateBtn.innerText = 'Update';
    updateBtn.disabled = true;
    [updateFormName, updateFormColor, updateBtn].forEach(item => updateForm.appendChild(item));

    updateBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const data: ICarObj = {
        id: this.selectedId,
        name: updateFormName.value,
        color: updateFormColor.value,
      };
      await editCar(data);
      const updatetCar = document.getElementById(`car_${data.id}`)!;
      const carName = updatetCar.getElementsByClassName('car-name')[0] as HTMLHeadingElement;
      carName.innerText = data.name!;
      const carImg = updatetCar.getElementsByClassName('car-img')[0] as HTMLDivElement;
      carImg.querySelector('path')!.setAttribute('fill', data.color!);
      updateFormName.value = '';
      updateFormColor.value = '#000000';
      this.selectedId = 0;
      updateBtn.disabled = true;
    });

    const raceBtn = tagGenerator('button', 'btn', 'race_btn') as HTMLButtonElement;
    raceBtn.innerText = 'Race';
    const resetBtn = tagGenerator('button', 'btn', 'reset_btn') as HTMLButtonElement;
    resetBtn.innerText = 'Reset';
    resetBtn.disabled = true;

    const moveCar: () => Promise<void> = async () => {
      raceBtn.disabled = true;
      const carRows: HTMLDivElement[] = Array.from(document.getElementsByClassName('car-row'))
        .filter((item) => !item.classList.contains('hide')) as HTMLDivElement[];
      const getCarsRaceDate = async (): Promise<[number, HTMLElement, HTMLElement, number, number, number][]> => {
        const carsRaceData: [number, HTMLElement, HTMLElement, number, number, number][] = [];
        for (const item of carRows) {
          const id: number = +item.id.split('_')[1]!;
          const carImg = item.getElementsByClassName('car-img')[0]! as HTMLElement;
          const flagImg = item.getElementsByClassName('flag-img')[0]! as HTMLElement;
          const carName = item.getElementsByClassName('car-name')[0]! as HTMLElement;
          const { velocity, distance }: { velocity: number, distance: number } = await engineSwitch(id, 'started');
          const range = calculateDistance(carImg, flagImg);
          carsRaceData.push([id, carImg, carName, velocity, distance, range ]);
        }
        const removeCar = () => {
          carsRaceData.forEach((item) => item[1].style.left = '');
          resetBtn.removeEventListener('click', removeCar);
        };
        resetBtn.addEventListener('click', removeCar);
        return carsRaceData;
      };
      const addMovement = async (carsRaceData: [number, HTMLElement, HTMLElement, number, number, number][]) => {
        carsRaceData.forEach(async ([ id, carImg, carName, velocity, distance, range ]) => {
          let q: number = 0;
          const timer = setInterval(async () => {
            if (q > range) {
              clearInterval(timer);
              const carTime: number = +(distance / velocity / 1000).toFixed(2);
              if (this.carWon.time > carTime) {
                this.carWon.id = id;
                this.carWon.time = carTime;
                this.winnerWindow(`${carName.innerText} has won with time ${carTime}s!\nCongratilations!`);
                raceBtn.disabled = false;
                setTimeout(() => {
                  document.getElementById('congrats')?.remove();
                }, 5000);
                await addWinner(this.carWon);
                document.getElementById('winners_page')?.remove();
                this.winners.createWinnersSection();
              }
            } else { 
              q += range / (distance / velocity / 20) ;
              carImg.style.left = `${q}px`;
            }
          }, 20);
          resetBtn.addEventListener('click', () => {
            clearInterval(timer);
            raceBtn.disabled = false;
            resetBtn.disabled = true;
          });
          const engDrive = await engineDrive(id);
          if ( typeof engDrive === 'string' ) clearInterval(timer);        
        });
      };
      console.log('Preparing...');
      this.winnerWindow('Preparing...'); 
      const carsRaceData = await getCarsRaceDate();
      document.getElementById('congrats')?.remove();
      resetBtn.disabled = false;
      console.log('Go');
      await addMovement(carsRaceData);
    };

    raceBtn.addEventListener('click', moveCar);


    const generatorBtn = tagGenerator('button', 'btn', 'generator_btn') as HTMLButtonElement;
    generatorBtn.classList.add('green-btn');
    generatorBtn.innerText = 'Generate Cars';
    generatorBtn.addEventListener('click', async () => {
      const table = document.getElementById('cars_table')!;
      const nextBtn = document.getElementById('next_main_btn')! as HTMLButtonElement;
      for (let i = 0; i < 100; i++) {
        const data: ICarObj = {
          name: `${carData.carBrend[Math.floor(Math.random() * 10)]} ${carData.carModel[Math.floor(Math.random() * 10)]}`,
          color: getRandomColor(),
          id: Math.floor(Math.random() * 100000000),
        };
        if (await addCar(data)) {
          this.allCars.push(data);
          let idx = this.allCars.findIndex((item) => item.id === data.id);
          const row = this.createCarRow(data);
          if (idx < 7 * (this.currPage - 1) || idx > 6 + 7 * (this.currPage - 1)) row.classList.add('hide');
          table.appendChild(row);
        }
        nextBtn.disabled = false;
        document.getElementById('table_name')!.innerText = `Garage(${this.allCars.length})`;
      }
      const carsRows = Array.from(document.getElementsByClassName('car-row'));
      carsRows.forEach((item, index) => {
        if (index >= 7 * (this.currPage - 1) && index <= 6 + 7 * (this.currPage - 1)) item.classList.remove('hide');
        else item.classList.add('hide');
      });
    });

    [raceBtn, resetBtn, generatorBtn].forEach(item => actionBtnsDiv.appendChild(item));
   

    [createForm, updateForm, actionBtnsDiv].forEach(item => setUpDiv.appendChild(item));

    this.mainPage.appendChild(setUpDiv);
  }

  async createCarTable(): Promise<void> {


    const tableContainer = tagGenerator('div', 'table-container', 'cars_table') as HTMLDivElement;
    const tableName = tagGenerator('h2', 'table-name', 'table_name') as HTMLHeadingElement;
    tableName.innerText = `Garage(${this.allCars.length})`;
    const tablePageNum = tagGenerator('h3', 'table-page-num', 'page_num') as HTMLHeadingElement;
    tablePageNum.innerText = `Page #${this.currPage}`;
    const table = tagGenerator('div', 'table-container', 'cars_table') as HTMLDivElement;
    const paggContainer = tagGenerator('div', 'pagg-cont') as HTMLDivElement;
    const prevBtn = tagGenerator('button', 'btn', 'prev_main_btn') as HTMLButtonElement;
    if (+tablePageNum.innerText.split('#')[1] === 1) {
      prevBtn.disabled = true;
    }
    prevBtn.innerText = 'Prev Page';
    const nextBtn = tagGenerator('button', 'btn', 'next_main_btn') as HTMLButtonElement;
    if (+tablePageNum.innerText.split('#')[1] >= (this.allCars.length / 7)) {
      nextBtn.disabled = true;
    }
    nextBtn.innerText = 'Next Page';
    prevBtn.addEventListener('click', () => {
      const carsRows = Array.from(document.getElementsByClassName('car-row'));
      if (this.currPage === 1) return;
      this.currPage -= 1;
      if (this.currPage === 1) prevBtn.disabled = true;
      if (this.currPage < (this.allCars.length / 7)) nextBtn.disabled = false;
      tablePageNum.innerText = `Page #${this.currPage}`;
      carsRows.forEach((item, index) => {
        if (index >= 7 * (this.currPage - 1) && index <= 6 + 7 * (this.currPage - 1)) item.classList.remove('hide');
        else item.classList.add('hide');
      });
    });
   
    nextBtn.addEventListener('click', () => {
      const carsRows = Array.from(document.getElementsByClassName('car-row'));
      if (this.currPage > (this.allCars.length / 7) ) return;
      this.currPage += 1;
      if (this.currPage >= (this.allCars.length / 7)) nextBtn.disabled = true;
      if (this.currPage > 1) prevBtn.disabled = false;
      tablePageNum.innerText = `Page #${this.currPage}`;
      
      carsRows.forEach((item, index) => {
        if (index >= 7 * (this.currPage - 1) && index <= 6 + 7 * (this.currPage - 1)) item.classList.remove('hide');
        else item.classList.add('hide');
      });
    });
    [prevBtn, nextBtn].forEach((item) => paggContainer.appendChild(item));

    const carNodes: HTMLDivElement[] = this.allCars.map((car, index) => {
      const node = this.createCarRow(car);
      if (index < 7 * (this.currPage - 1) || index > 6 + 7 * (this.currPage - 1)) node.classList.add('hide');
      return node;
    });
    carNodes.forEach((item) => table.appendChild(item));

    [tableName, tablePageNum, paggContainer, table].forEach((item) => tableContainer.appendChild(item));
    this.upperTable.appendChild(tableContainer);
  }


  createCarRow(car: ICarObj): HTMLDivElement {
    const carRow = tagGenerator('div', 'car-row', `car_${car.id}`) as HTMLDivElement;
    const startBlock = tagGenerator('div', 'start-block') as HTMLDivElement;
    const startTopBlock = tagGenerator('div', 'start-top-block') as HTMLDivElement;
    const startBottomBlock = tagGenerator('div', 'start-bottom-block') as HTMLDivElement;
    
    const selectBtn = tagGenerator('button', 'btn', 'select_btn') as HTMLButtonElement;
    selectBtn.classList.add('green-btn');
    selectBtn.innerText = 'Select';
    selectBtn.addEventListener('click', () => {
      const createFormName = document.getElementById('update_name') as HTMLInputElement;
      const createFormColor = document.getElementById('update_color') as HTMLInputElement;
      this.selectedId = car.id!;
      const updateBtn = document.getElementById('update_btn') as HTMLButtonElement;
      updateBtn.disabled = false;
      createFormName.value = car.name!;
      createFormColor.value = car.color!;
    });

    const removeBtn = tagGenerator('button', 'btn', 'remove_btn') as HTMLButtonElement;
    removeBtn.classList.add('green-btn');
    removeBtn.innerText = 'Remove';
    removeBtn.addEventListener('click', () => {
      document.getElementById(`car_${car.id}`)?.remove();
      deleteCar(car.id!);
      this.allCars = this.allCars.filter((item) => item.id !== car.id);
      document.getElementById('table_name')!.innerText = `Garage(${this.allCars.length})`;
    });

    const carName = tagGenerator('h4', 'car-name') as HTMLHeadingElement;
    carName.innerText = car.name!;
    [selectBtn, removeBtn, carName].forEach(item => startTopBlock.appendChild(item));


    const aBtn = tagGenerator('button', 'pos-btn', `a_btn_${car.id}`) as HTMLButtonElement;
    aBtn.classList.add('btn-a', 'btn-a-active');
    aBtn.innerText = 'A';
    const bBtn = tagGenerator('button', 'pos-btn', `b_btn_${car.id}`) as HTMLButtonElement;
    bBtn.classList.add('btn-b');
    bBtn.innerText = 'B';
    
    const carImg = tagGenerator('div', 'car-img') as HTMLDivElement;
    carImg.innerHTML = carSvg;
    carImg.querySelector('path')?.setAttribute('fill', car.color!);
    [aBtn, bBtn, carImg].forEach(item => startBottomBlock.appendChild(item));

    const flagImg = tagGenerator('img', 'flag-img') as HTMLImageElement;
    flagImg.src = '../../assets/img/flag.png';
    let timer: NodeJS.Timer;
    const moveCar = async () => {
      aBtn.disabled = true;
      bBtn.classList.add('btn-b-active');
      aBtn.classList.remove('btn-a-active');
      const { velocity, distance } = await engineSwitch(car.id!, 'started');
      const range = calculateDistance(carImg, flagImg);
      let q = 0;
      timer = setInterval(() => {
        if (q > range) {
          clearInterval(timer);
        } else { 
          q += range / (distance / velocity / 20) ;
          carImg.style.left = `${q}px`;
        }
      }, 20);
      const engDrive = await engineDrive(car.id!);
      if ( typeof engDrive === 'string' ) clearInterval(timer);
      aBtn.disabled = false;
    };
    async function stopCar() {
      aBtn.classList.add('btn-a-active');
      bBtn.classList.remove('btn-b-active');
      clearInterval(timer);
      carImg.style.left = '';
      aBtn.disabled = false;
    }

    aBtn.addEventListener('click', moveCar);
    bBtn.addEventListener('click', stopCar);

    [startTopBlock, startBottomBlock].forEach(item => startBlock.appendChild(item));
    [startBlock, flagImg].forEach(item => carRow.appendChild(item));

    return carRow;
  }

  winnerWindow(text: string) {
    const back = tagGenerator('div', 'congrats-back', 'congrats') as HTMLDivElement;
    if (text !== 'Preparing...') back.addEventListener('click', () => back.remove());
    const congratsText = tagGenerator('div', 'congrats-text') as HTMLDivElement;
    congratsText.innerText = text;
    back.appendChild(congratsText);
    document.body.appendChild(back);
  }
}