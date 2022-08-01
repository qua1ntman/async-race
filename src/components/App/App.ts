import { Winners } from '../../components/Winners/Winners';
import { Main } from '../../components/Main/Main';
import { tagGenerator } from '../../helpers';
import './App.scss';

export class App {

  main = new Main();

  winners = new Winners();

  async start() {
    const root = document.getElementById('root')! as HTMLElement;
    const main = document.createElement('main') as HTMLElement;
    main.id = 'main';
    root.appendChild(this.createHeader());
    root.appendChild(this.createLoader());
    root.appendChild(main);
    await this.main.createMainSection();
    document.getElementById('loader')?.remove();
    await this.winners.createWinnersSection();
  }

  createLoader(): HTMLElement {
    const loaderWrapper = tagGenerator('div', 'loader', 'loader') as HTMLDivElement;
    const loader = tagGenerator('div', 'lds-circle', 'loader') as HTMLDivElement;
    loader.innerHTML = '<div></div>';
    loaderWrapper.appendChild(loader);
    return loaderWrapper;
  }

  createHeader() {
    const header = tagGenerator('header', 'header') as HTMLElement;
    const nav = tagGenerator('nav', 'nav') as HTMLElement;
    
    const toGarage = tagGenerator('a', 'nav-btns', 'to_gatage') as HTMLLinkElement;
    const toWinners = tagGenerator('a', 'nav-btns', 'to_winners') as HTMLLinkElement;

    toGarage.innerText = 'To Garage';
    toWinners.innerText = 'To Winners';

    toGarage.addEventListener('click', () => {
      const main = document.getElementById('cars_page') as HTMLElement;
      const winners = document.getElementById('winners_page') as HTMLElement;
      winners?.classList.add('hide');
      main?.classList.remove('hide');
    });
    toWinners.addEventListener('click', () => {
      const main = document.getElementById('cars_page') as HTMLElement;
      const winners = document.getElementById('winners_page') as HTMLElement;
      main?.classList.add('hide');
      winners?.classList.remove('hide');
    });

    const mainSection = document.getElementById('main_section');
    const winnersSection = document.getElementById('winners_section');

    toGarage.addEventListener('click', () => {
      mainSection?.classList.remove('hide');
      winnersSection?.classList.add('hide');
    });

    toWinners.addEventListener('click', () => {
      mainSection?.classList.add('hide');
      winnersSection?.classList.remove('hide');
    });

    nav.appendChild(toGarage);
    nav.appendChild(toWinners);
    header.appendChild(nav);

    return header;
  }
}