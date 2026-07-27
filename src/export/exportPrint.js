export function preparePrintView() {
  document.body.classList.add('printing-proposal');
  setTimeout(() => document.body.classList.remove('printing-proposal'), 1200);
}

export function printProposal() {
  preparePrintView();
  window.print();
}
