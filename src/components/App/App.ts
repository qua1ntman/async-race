import { Winners } from '../../components/Winners/Winners';
import { Main } from '../../components/Main/Main';
import { tagGenerator } from '../../helpers';
import './App.scss';
// import { engineDrive, engineSwitch } from '../../Queries';
// import { calculateDistance } from './../../helpers';



export class App {

  main = new Main();

  winners = new Winners();

  async start() {
    const root = document.getElementById('root')!;
    const main = document.createElement('main');
    main.id = 'main';
    root.appendChild(this.createHeader());
    root.appendChild(this.createLoader());
    root.appendChild(main);
    await this.main.createMainSection();
    document.getElementById('loader')?.remove();
    await this.winners.createWinnersSection();
  }

  createLoader(): HTMLElement {
    const loaderWrapper = tagGenerator('div', 'loader', 'loader');
    const loader = tagGenerator('div', 'lds-circle', 'loader');
    loader.innerHTML = '<div></div>';
    loaderWrapper.appendChild(loader);
    return loaderWrapper;
  }

  createHeader() {
    const header = tagGenerator('header', 'header');
    const nav = tagGenerator('nav', 'nav');
    
    const toGarage = tagGenerator('a', 'nav-btns', 'to_gatage');
    const toWinners = tagGenerator('a', 'nav-btns', 'to_winners');

    toGarage.innerText = 'To Garage';
    toWinners.innerText = 'To Winners';

    toGarage.addEventListener('click', () => {
      const main = document.getElementById('cars_page');
      const winners = document.getElementById('winners_page');
      winners?.classList.add('hide');
      main?.classList.remove('hide');
    });
    toWinners.addEventListener('click', () => {
      const main = document.getElementById('cars_page');
      const winners = document.getElementById('winners_page');
      main?.classList.add('hide');
      winners?.classList.remove('hide');
    });

    const mainSection = document.getElementById('main_section')!;
    const winnersSection = document.getElementById('winners_section')!;

    toGarage.addEventListener('click', () => {
      mainSection.classList.remove('hide');
      winnersSection.classList.add('hide');
    });

    toWinners.addEventListener('click', () => {
      mainSection.classList.add('hide');
      winnersSection.classList.remove('hide');
    });

    nav.appendChild(toGarage);
    nav.appendChild(toWinners);
    header.appendChild(nav);

    return header;
  }
}