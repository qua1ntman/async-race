import { tagGenerator } from '../../helpers';
import './Winners.scss';
import { getCar, getWinners, getWinnersNumber } from '../../Queries';
import { IWinnerObj } from '../../DataIntarfaces';
import { carSvg } from '../../carSvg';
import { ICarObj } from './../../DataIntarfaces';

export class Winners {

  currPage = 1;

  async createWinnersSection(): Promise<void> {
    const winnersNum: number = await getWinnersNumber();
    const winners: IWinnerObj[] = await getWinners(this.currPage);
    

    const winnersPage = tagGenerator('section', 'winners-section', 'winners_page') as HTMLBaseElement;
    winnersPage.classList.add('hide');
    const tableName = tagGenerator('h2', 'table-name', 'table_name') as HTMLHeadingElement;
    tableName.innerText = `Winners(${winnersNum})`;
    const tablePageNum = tagGenerator('h3', 'table-page-num', 'page_num') as HTMLHeadingElement;
    tablePageNum.innerText = `Page #${this.currPage}`;

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
      this.createWinnersSection();
    });
    const nextBtn = tagGenerator('button', 'btn', 'next_main_btn') as HTMLButtonElement;
    if (+tablePageNum.innerText.split('#')[1] >= (winnersNum / 5)) {
      nextBtn.disabled = true;
    }
    nextBtn.innerText = 'Next Page';
    nextBtn.addEventListener('click', () => {
      if (this.currPage > (winnersNum / 5) ) return;
      this.currPage += 1;
      document.getElementById('cars_table')!.remove();
      this.createWinnersSection();
    });
    [prevBtn, nextBtn].forEach((item) => paggContainer.appendChild(item));

    const table = tagGenerator('table', 'table-container', 'winners_table') as HTMLTableElement;
    const tableHeader = tagGenerator('thead', 'table-container') as HTMLTableElement;
    const tableHeaderRow = tagGenerator('tr', 'table-row') as HTMLTableRowElement;
    tableHeaderRow.classList.add('blue-table-header');
    ['Number', 'Car', 'Name', 'Wins', 'Best time (seconds)'].forEach((cell) => {
      const cellTH = tagGenerator('th', 'table-cell') as HTMLTableCellElement;
      cellTH.innerText = cell;
      tableHeaderRow.appendChild(cellTH);
    });
    tableHeader.appendChild(tableHeaderRow);

    const tableBody = tagGenerator('tbody', 'table-container') as HTMLTableElement;

    winners.forEach(async (winner, index) => {
      tableBody.appendChild(await this.createWinnerRow(winner, index));
    });

    [tableHeader, tableBody].forEach(item => table.appendChild(item));
    [tableName, tablePageNum, paggContainer, table].forEach(item => winnersPage.appendChild(item));
    document.getElementById('main')?.appendChild(winnersPage);
  }

  async createWinnerRow(winner: IWinnerObj, index: number): Promise<HTMLTableRowElement> {
    const car: ICarObj = await getCar(winner.id!);

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