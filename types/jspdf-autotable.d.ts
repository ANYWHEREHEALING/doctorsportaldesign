declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';
  const autoTable: (doc: jsPDF, options: any) => jsPDF;
  export default autoTable;
} 