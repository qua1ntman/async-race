import { addCar, addWinner, deleteCar, editCar, engineDrive, engineSwitch, getCars, getCarsNumber } from '../../Queries';
import { calculateDistance, getRandomColor, tagGenerator } from '../../helpers';
import './Main.scss';
import { ICarObj } from './../../DataIntarfaces';
import { carSvg } from '../../carSvg';
import { carData } from '../../carNameData';
import { Winners } from '../Winners/Winners';

export class Main {

  winners: Winners = new Winners();

  selectedId: number = 0;

  currPage: number = 1;

  mainPage = tagGenerator('section', 'cars-section', 'cars_page') as HTMLBaseElement;
  
  upperTable = tagGenerator('div', 'upper-table') as HTMLDivElement;
  
  carWon: { id: number, time: number } = { id: 0, time: 100000 };

  carsRaceData: [number, HTMLElement, HTMLElement, number, number, number][] = [];

  async createMainSection(): Promise<void> {
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
          name: createFormName.value,
          color: createFormColor.value,
        };
        await addCar(data);
        createFormName.value = '';
        createFormColor.value = '#000000';
        document.getElementById('cars_table')!.remove();
        this.createCarTable();
      }
    });
    
    [createFormName, createFormColor, createBtn, errorDiv].forEach(item => createForm.appendChild(item));
    
    const updateFormName = tagGenerator('input', 'car-name-input', 'update_name') as HTMLInputElement;
    updateFormName.setAttribute('autocomplete', 'off');
    const updateFormColor = tagGenerator('input', 'car-color-input', 'update_color') as HTMLInputElement;
    updateFormColor.type = 'color';
    const updateBtn = tagGenerator('button', 'btn', 'update_btn') as HTMLButtonElement;
    updateBtn.innerText = 'Update';
    [updateFormName, updateFormColor, updateBtn].forEach(item => updateForm.appendChild(item));

    updateBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (updateFormName.value === '') {
        updateFormName.setAttribute('placeholder', 'There is no data (ᗒᗣᗕ)՞');
        updateFormName.classList.add('red-placeholder');
        setTimeout(() => {
          updateFormName.removeAttribute('placeholder');
          updateFormName.classList.remove('red-placeholder');
        }, 2000);
      } else {
        const data: ICarObj = {
          id: this.selectedId,
          name: updateFormName.value,
          color: updateFormColor.value,
        };
        
        await editCar(data);
        updateFormName.value = '';
        updateFormColor.value = '#000000';
        document.getElementById('cars_table')!.remove();
        this.createCarTable();
      }
    });

    const raceBtn = tagGenerator('button', 'btn', 'race_btn') as HTMLButtonElement;
    raceBtn.innerText = 'Race';
    const moveCar: () => Promise<void> = async () => {
      raceBtn.disabled = true;
      const carRows = Array.from(document.getElementsByClassName('car-row')) as HTMLDivElement[];
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
                this.winnerWindow(`${carName.innerText} has won! Congratilations!`); 
                setTimeout(() => {
                  document.getElementById('congrats')?.remove();
                }, 7000);
                await addWinner(this.carWon);
                document.getElementById('winners_page')?.remove();
                this.winners.createWinnersSection();
              }
            } else { 
              q += range / (distance / velocity / 20) ;
              carImg.style.left = `${q}px`;
            }
          }, 20);
          const engDrive = await engineDrive(id);
          if ( typeof engDrive === 'string' ) clearInterval(timer);
        });
      };
      console.log('Preparing...');
      this.winnerWindow('Preparing...'); 
      const carsRaceData = await getCarsRaceDate();
      document.getElementById('congrats')?.remove();
      console.log('Go');
      await addMovement(carsRaceData);
    };

    raceBtn.addEventListener('click', moveCar);
    const resetBtn = tagGenerator('button', 'btn', 'reset_btn') as HTMLButtonElement;
    resetBtn.innerText = 'Reset';
    resetBtn.addEventListener('click', () => {
      raceBtn.disabled = false;
      window.location.reload();
    });

    const generatorBtn = tagGenerator('button', 'btn', 'generator_btn') as HTMLButtonElement;
    generatorBtn.innerText = 'Generate Cars';
    generatorBtn.addEventListener('click', async () => {
      for (let i = 0; i < 100; i++) {
        const data: ICarObj = {
          name: `${carData.carBrend[Math.floor(Math.random() * 10)]} ${carData.carModel[Math.floor(Math.random() * 10)]}`,
          color: getRandomColor(),
        };
        await addCar(data);
      }
      document.getElementById('cars_table')!.remove();
      this.createCarTable();
    });

    [raceBtn, resetBtn, generatorBtn].forEach(item => actionBtnsDiv.appendChild(item));
   

    [createForm, updateForm, actionBtnsDiv].forEach(item => setUpDiv.appendChild(item));

    this.mainPage.appendChild(setUpDiv);
  }

  async createCarTable(): Promise<void> {
    const cars = await getCars(this.currPage);
    const carsNum = await getCarsNumber();
    const tableContainer = tagGenerator('div', 'table-container', 'cars_table') as HTMLDivElement;
    const tableName = tagGenerator('h2', 'table-name', 'table_name') as HTMLHeadingElement;
    tableName.innerText = `Garage(${carsNum})`;
    const tablePageNum = tagGenerator('h3', 'table-page-num', 'page_num') as HTMLHeadingElement;
    tablePageNum.innerText = `Page #${this.currPage}`;
    const table = tagGenerator('div', 'table-container', 'cars_table') as HTMLDivElement;
    const paggContainer = tagGenerator('div', 'pagg-cont') as HTMLDivElement;
    const prevBtn = tagGenerator('button', 'btn', 'prev_main_btn') as HTMLButtonElement;
    if (+tablePageNum.innerText.split('#')[1] === 1) {
      prevBtn.disabled = true;
    }
    prevBtn.innerText = 'Prev Page';
    prevBtn.addEventListener('click', () => {
      if (this.currPage === 1) return;
      this.currPage -= 1;
      document.getElementById('cars_table')!.remove();
      this.createCarTable();
    });
    const nextBtn = tagGenerator('button', 'btn', 'next_main_btn') as HTMLButtonElement;
    if (+tablePageNum.innerText.split('#')[1] >= (carsNum / 7)) {
      nextBtn.disabled = true;
    }
    nextBtn.innerText = 'Next Page';
    nextBtn.addEventListener('click', () => {
      if (this.currPage > (carsNum / 7) ) return;
      this.currPage += 1;
      document.getElementById('cars_table')!.remove();
      this.createCarTable();
    });
    [prevBtn, nextBtn].forEach((item) => paggContainer.appendChild(item));

    cars.forEach((car) => {
      table.appendChild(this.createCarRow(car));
    });

    [tableName, tablePageNum, paggContainer, table].forEach((item) => tableContainer.appendChild(item));
    this.upperTable.appendChild(tableContainer);
  }


  createCarRow(car: ICarObj): HTMLDivElement {
    const carRow = tagGenerator('div', 'car-row', `car_${car.id}`) as HTMLDivElement;
    const startBlock = tagGenerator('div', 'start-block') as HTMLDivElement;
    const startTopBlock = tagGenerator('div', 'start-top-block') as HTMLDivElement;
    const startBottomBlock = tagGenerator('div', 'start-bottom-block') as HTMLDivElement;
    
    const selectBtn = tagGenerator('button', 'btn', 'select_btn') as HTMLButtonElement;
    selectBtn.innerText = 'Select';
    selectBtn.addEventListener('click', () => {
      const createFormName = document.getElementById('update_name') as HTMLInputElement;
      const createFormColor = document.getElementById('update_color') as HTMLInputElement;
      this.selectedId = car.id!;
      createFormName.value = car.name!;
      createFormColor.value = car.color!;
    });

    const removeBtn = tagGenerator('button', 'btn', 'remove_btn') as HTMLButtonElement;
    removeBtn.innerText = 'Remove';
    removeBtn.addEventListener('click', async () => {
      await deleteCar(car.id!);
      document.getElementById('cars_table')!.remove();
      this.createCarTable();
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
      aBtn.removeEventListener('click', moveCar);
    };
    bBtn.addEventListener('click', async () => {
      aBtn.classList.add('btn-a-active');
      bBtn.classList.remove('btn-b-active');
      clearInterval(timer);
      carImg.style.left = '';
      aBtn.addEventListener('click', moveCar);
    });

    aBtn.addEventListener('click', moveCar);

    [startTopBlock, startBottomBlock].forEach(item => startBlock.appendChild(item));
    [startBlock, flagImg].forEach(item => carRow.appendChild(item));

    return carRow;
  }

  winnerWindow(text: string) {
    const back = tagGenerator('div', 'congrats-back', 'congrats') as HTMLDivElement;
    const congratsText = tagGenerator('div', 'congrats-text') as HTMLDivElement;
    congratsText.innerText = text;
    back.appendChild(congratsText);
    document.body.appendChild(back);
  }
}