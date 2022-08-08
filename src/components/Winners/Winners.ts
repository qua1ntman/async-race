import { tagGenerator } from '../../helpers';
import './Winners.scss';
import { getWinners } from '../../Queries';
import { IWinnerObj } from '../../DataIntarfaces';
import { carSvg } from '../../carSvg';
import { ICarObj } from './../../DataIntarfaces';

export class Winners {

  currPage: number = +localStorage.getItem('winnersPage')! || 1;

  allCars: ICarObj[] = [];

  allWinners: IWinnerObj[] = [];

  async createWinnersSection(): Promise<void> {
    this.allWinners = await getWinners();

    const winnersPage = tagGenerator('section', 'winners-section', 'winners_page') as HTMLBaseElement;
    winnersPage.classList.add('hide');
    const tableName = tagGenerator('h2', 'table-name', 'table_name') as HTMLHeadingElement;
    tableName.innerText = `Winners(${this.allWinners.length})`;
    const tablePageNum = tagGenerator('h3', 'table-page-num', 'page_num') as HTMLHeadingElement;
    tablePageNum.innerText = `Page #${this.currPage}`;

    const paggContainer = tagGenerator('div', 'pagg-cont') as HTMLDivElement;
    const prevBtn = tagGenerator('button', 'btn', 'prev_winners_btn') as HTMLButtonElement;
    if (+tablePageNum.innerText.split('#')[1] === 1) {
      prevBtn.disabled = true;
    }
    prevBtn.innerText = 'Prev Page';
    
    const nextBtn = tagGenerator('button', 'btn', 'next_winners_btn') as HTMLButtonElement;
    if (+tablePageNum.innerText.split('#')[1] >= (this.allWinners.length / 5)) {
      nextBtn.disabled = true;
    }
    nextBtn.innerText = 'Next Page';
    prevBtn.addEventListener('click', () => {
      const winnersRows = Array.from(document.getElementsByClassName('table-row'));
      if (this.currPage === 1) return;
      this.currPage -= 1;
      localStorage.setItem('winnersPage', `${this.currPage}`);
      if (this.currPage === 1) prevBtn.disabled = true;
      if (this.currPage < (this.allWinners.length / 5)) nextBtn.disabled = false;
      tablePageNum.innerText = `Page #${this.currPage}`;
      winnersRows.forEach((item, index) => {
        if (index >= 10 * (this.currPage - 1) && index <= 9 + 10 * (this.currPage - 1)) item.classList.remove('hide');
        else item.classList.add('hide');
      });
    });
   
    nextBtn.addEventListener('click', () => {
      const winnersRows = Array.from(document.getElementsByClassName('table-row'));
      if (this.currPage > (this.allWinners.length / 10)) return;
      this.currPage += 1;
      localStorage.setItem('winnersPage', `${this.currPage}`);
      if (this.currPage > (this.allWinners.length / 10)) nextBtn.disabled = true;
      if (this.currPage > 1) prevBtn.disabled = false;
      tablePageNum.innerText = `Page #${this.currPage}`;
      
      winnersRows.forEach((item, index) => {
        if (index >= 10 * (this.currPage - 1) && index <= 9 + 10 * (this.currPage - 1)) item.classList.remove('hide');
        else item.classList.add('hide');
      });
    });
    [prevBtn, nextBtn].forEach((item) => paggContainer.appendChild(item));

    const table = tagGenerator('table', 'table-container', 'winners_table') as HTMLTableElement;
    const tableHeader = tagGenerator('thead', 'table-container') as HTMLTableElement;
    const tableHeaderRow = tagGenerator('tr', 'blue-table-header') as HTMLTableRowElement;
    ['Number', 'Car', 'Name', 'Wins', 'Best time (seconds)'].forEach((cell) => {
      const cellTH = tagGenerator('th', 'table-cell') as HTMLTableCellElement;
      cellTH.innerText = cell;
      tableHeaderRow.appendChild(cellTH);
    });
    tableHeader.appendChild(tableHeaderRow);

    const tableBody = tagGenerator('tbody', 'table-container') as HTMLTableElement;
    const winnersNodes: HTMLDivElement[] = this.allWinners.map((winner, index) => {
      const node = this.createWinnerRow(winner, index);
      if (index < 10 * (this.currPage - 1) || index > 9 + 10 * (this.currPage - 1)) node.classList.add('hide');
      return node;
    });
    winnersNodes.forEach((winner) => tableBody.appendChild(winner));

    [tableHeader, tableBody].forEach(item => table.appendChild(item));
    [tableName, tablePageNum, paggContainer, table].forEach(item => winnersPage.appendChild(item));
    document.getElementById('main')?.appendChild(winnersPage);
  }

  createWinnerRow(winner: IWinnerObj, index: number): HTMLTableRowElement {
    const car: ICarObj = this.allCars.find((item) => item.id === winner.id)!;

    const winnerRow = tagGenerator('tr', 'table-row', `winner_${car.id}`) as HTMLTableRowElement;
    const winnerNumber = tagGenerator('td', 'table-cell') as HTMLTableCellElement;
    winnerNumber.innerText = `${index + 1}`;
    const winnerCar = tagGenerator('td', 'table-cell') as HTMLTableCellElement;
    winnerCar.classList.add('winners-car-img');
    winnerCar.innerHTML = carSvg;
    winnerCar.querySelector('path')?.setAttribute('fill', car.color!);

    const winnerName = tagGenerator('td', 'table-cell') as HTMLTableCellElement;
    winnerName.innerText = car.name!;
    const winnerWins = tagGenerator('td', 'table-cell') as HTMLTableCellElement;
    winnerWins.innerText = `${winner.wins}`;
    const winnerBestTime = tagGenerator('td', 'table-cell') as HTMLTableCellElement;
    winnerBestTime.innerText = `${winner.time}`;


    [winnerNumber, winnerCar, winnerName, winnerWins, winnerBestTime].forEach(item => winnerRow.appendChild(item));

    return winnerRow;
  }
}