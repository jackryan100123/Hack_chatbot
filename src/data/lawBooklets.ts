import { LawBooklet } from '../types';

const lawBooklets: LawBooklet[] = [
  {
    id: '1',
    title: 'Bharatiya Nyaya Sanhita (BNS) - Complete Act',
    description: 'The complete Bharatiya Nyaya Sanhita (BNS) that replaces the Indian Penal Code (IPC).',
    filename: 'bns.pdf',
    fileSize: '1.26 MB',
    fileType: 'PDF',
    category: 'BNS',
    language: 'English'
  },
  {
    id: '2',
    title: 'Bharatiya Nagarik Suraksha Sanhita (BNSS) - Complete Act',
    description: 'The complete Bharatiya Nagarik Suraksha Sanhita (BNSS) that replaces the Code of Criminal Procedure (CrPC).',
    filename: 'bnss.pdf',
    fileSize: '1.93 MB',
    fileType: 'PDF',
    category: 'BNSS',
    language: 'English'
  },
  {
    id: '3',
    title: 'Bharatiya Sakshya Adhiniyam (BSA) - Complete Act',
    description: 'The complete Bharatiya Sakshya Adhiniyam (BSA) that replaces the Indian Evidence Act(IEA).',
    filename: 'bsa.pdf',
    fileSize: '0.65 MB',
    fileType: 'PDF',
    category: 'BSA',
    language: 'English'
  },
  {
  id: '4',
  title: 'Comparison Summary BNS to IPC',
  description: 'A concise comparison between the Bharatiya Nyaya Sanhita (BNS) and the Indian Penal Code (IPC), highlighting major structural and substantive changes in criminal law.',
  filename: 'bns_ipc_comparison.pdf',
  fileSize: '0.70 MB',
  fileType: 'PDF',
  category: 'BNS',
  language: 'English'
},
{
  id: '5',
  title: 'Comparison Summary BNSS to CrPC',
  description: 'This document compares the Bharatiya Nagarik Suraksha Sanhita (BNSS) with the Criminal Procedure Code (CrPC), outlining key reforms in procedures, investigation, and trial processes.',
  filename: 'bnss_crpc_comparison.pdf',
  fileSize: '0.65 MB',
  fileType: 'PDF',
  category: 'BNSS',
  language: 'English'
},
{
  id: '6',
  title: 'Comparison Summary BSA to IEA',
  description: 'An in-depth summary comparing the Bharatiya Sakshya Adhiniyam (BSA) with the Indian Evidence Act (IEA), detailing changes in the admissibility and treatment of evidence.',
  filename: 'bsa_iea_comparison.pdf',
  fileSize: '0.39 MB',
  fileType: 'PDF',
  category: 'BSA',
  language: 'English'
},
  {
    id: '7',
    title: 'Preliminary Enquiry SOP',
    description: 'Standard Operating Procedure for conducting a preliminary enquiry.',
    filename: 'PreliminaryEnquiry.pdf',
    fileSize: '2.0 MB',
    fileType: 'PDF',
    category: 'SOP',
    language: 'English'
  },
  {
    id: '8',
    title: 'Zero FIR SOP',
    description: 'Standard Operating Procedure for filing a Zero FIR.',
    filename: 'Zero FIR.pdf',
    fileSize: '1.6 MB',
    fileType: 'PDF',
    category: 'SOP',
    language: 'English'
  },
  {
    id: '9',
    title: 'Arrest SOP',
    description: 'Standard Operating Procedure related to arrests.',
    filename: 'Arrest.pdf',
    fileSize: '2.4 MB',
    fileType: 'PDF',
    category: 'SOP',
    language: 'English'
  },
  {
    id: '10',
    title: 'To Produce Documents SOP',
    description: 'Standard Operating Procedure for producing documents.',
    filename: 'To produce Documents.pdf',
    fileSize: '2.7 MB',
    fileType: 'PDF',
    category: 'SOP',
    language: 'English'
  },
  {
    id: '11',
    title: 'Summon, Warrants & Notice SOP',
    description: 'Standard Operating Procedure for handling summons, warrants, and notices.',
    filename: 'Summon, Warrants & Notice.pdf',
    fileSize: '3.4 MB',
    fileType: 'PDF',
    category: 'SOP',
    language: 'English'
  },
  {
    id: '12',
    title: 'RunAway Couple SOP',
    description: 'Standard Operating Procedure for handling cases of runaway couples.',
    filename: 'RunAway Couple.pdf',
    fileSize: '2.1 MB',
    fileType: 'PDF',
    category: 'SOP',
    language: 'English'
  },
  {
    id: '13',
    title: 'Request to Bank for Bank Details Form',
    description: 'Form for requesting bank details.',
    filename: 'Request to bank for bank details.pdf',
    fileSize: '104 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '14',
    title: 'Cyber Crime Complaint Letter Format',
    description: 'Standard letter format for lodging a cyber crime complaint.',
    filename: 'Cyber-Crime-Complaint-Letter-Format-.pdf',
    fileSize: '59 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '15',
    title: 'Request Details from Facebook Form',
    description: 'Form for requesting details from Facebook.',
    filename: 'Request details from Facebook .pdf',
    fileSize: '124 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '16',
    title: 'Bond and Bail-Bond after Arrest under a Warrant Form',
    description: 'Form for bond and bail-bond after arrest under a warrant.',
    filename: 'Bond and Bail-Bond after Arrest under a Warrant.pdf',
    fileSize: '61 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '17',
    title: 'Bond for Good Behaviour Form',
    description: 'Form for bond for good behaviour.',
    filename: 'Bond for Good Behaviour.pdf',
    fileSize: '69 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '18',
    title: 'INJUNCTION TO PROVIDE AGAINST IMMINENT DANGER PENDING INQUIRY Form',
    description: 'Form for injunction to provide against imminent danger pending inquiry.',
    filename: 'INJUNCTION TO PROVIDE AGAINST IMMINENT DANGER PENDING INQUIRY.pdf',
    fileSize: '54 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '19',
    title: 'MAGISTRATE\'S ORDER DECLARING PARTY ENTITLED TO RETAIN POSSESSION OF LAND Form',
    description: 'Magistrate\'s order form for retaining possession of land.',
    filename: 'MAGISTRATE\'S ORDER DECLARING PARTY ENTITLED TO RETAIN POSSESSION OF LAND, ETC., IN.pdf',
    fileSize: '94 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '20',
    title: 'Order Authorising an Attachment by District Magistrate Form',
    description: 'Form for order authorising an attachment by District Magistrate.',
    filename: 'Order Authorising an attachment by District Magistriate .pdf',
    fileSize: '84 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '21',
    title: 'Order of Attachment to Compel the Appearance of a Person Accused Form',
    description: 'Form for order of attachment to compel appearance of accused person.',
    filename: 'Order of Attachment to Compel the Appearance of a Person Accused.pdf',
    fileSize: '92 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '22',
    title: 'Order of Attachment to Compel the Attendance of a Witness Form',
    description: 'Form for order of attachment to compel attendance of a witness.',
    filename: 'Order of Attachment to Compel the Attendance of a Witness.pdf',
    fileSize: '66 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '23',
    title: 'Proclamation Requiring the Appearance of a Person Accused Form',
    description: 'Form for proclamation requiring appearance of an accused person.',
    filename: 'Proclamation Requiring the Appearance of a Person Accused.pdf',
    fileSize: '54 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '24',
    title: 'Proclamation Requiring the Attendance of a Witness Form',
    description: 'Form for proclamation requiring attendance of a witness.',
    filename: 'Proclamation Requiring the Attendance of a Witness.pdf',
    fileSize: '67 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '25',
    title: 'SPECIAL SUMMONS TO A PERSON ACCUSED OF A PETTY OFFENCE Form',
    description: 'Special summons form for a person accused of a petty offence.',
    filename: 'SPECIAL SUMMONS TO A PERSON ACCUSED OF A PETTY OFFENCE.pdf',
    fileSize: '30 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '26',
    title: 'Summons of Information of a Probable Breach of the Peace Form',
    description: 'Form for summons of information regarding a probable breach of peace.',
    filename: 'Summons of Information of a  Probable breach of the peace .pdf',
    fileSize: '61 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '27',
    title: 'Summons to an Accused Person Form',
    description: 'Summons form for an accused person.',
    filename: 'Summons to an Accused Person.pdf',
    fileSize: '36 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '28',
    title: 'Warrant in the First Instance to Bring Up a Witness Form',
    description: 'Form for warrant to bring up a witness in the first instance.',
    filename: 'Warrant in the First Instance to Bring Up a Witness.pdf',
    fileSize: '65 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '29',
    title: 'Warrant of Arrest Form',
    description: 'Form for warrant of arrest.',
    filename: 'Warrant of Arrest.pdf',
    fileSize: '56 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '30',
    title: 'WARRANT OF COMMITMENT ON FAILURE TO FIND SECURITY FOR GOOD BEHAVIOUR Form',
    description: 'Form for warrant of commitment on failure to find security for good behaviour.',
    filename: 'WARRANT OF COMMITMENT ON FAILURE TO FIND SECURITY FOR GOOD BEHAVIOUR.pdf',
    fileSize: '108 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '31',
    title: 'WARRANT OF COMMITMENT ON FAILURE TO FIND SECURITY TO KEEP THE PEACE Form',
    description: 'Form for warrant of commitment on failure to find security to keep the peace.',
    filename: 'WARRANT OF COMMITMENT ON FAILURE TO FIND SECURITY TO KEEP THE PEACE.pdf',
    fileSize: '73 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '32',
    title: 'WARRANT OF IMPRISONMENT ON FAILURE TO PAY MAINTENANCE Form',
    description: 'Form for warrant of imprisonment on failure to pay maintenance.',
    filename: 'WARRANT OF IMPRISONMENT ON FAILURE TO PAY MAINTENANCE.pdf',
    fileSize: '77 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '33',
    title: 'Warrant to Discharge a Person Imprisoned on Failure to Give Security Form',
    description: 'Form for warrant to discharge a person imprisoned on failure to give security.',
    filename: 'Warrant to Discharge A Person Imprisoned on Failure to Give Security.pdf',
    fileSize: '61 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '34',
    title: 'Warrant to Search After Information of a Particular Offence Form',
    description: 'Form for warrant to search after information of a particular offence.',
    filename: 'Warrant to Search after Information of a Particular Offence.pdf',
    fileSize: '70 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '35',
    title: 'Warrant to Search Suspected Place of Deposit Form',
    description: 'Form for warrant to search suspected place of deposit.',
    filename: 'Warrant to Search Suspected Place of Deposit.pdf',
    fileSize: '137 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  },
  {
    id: '36',
    title: 'Notice for Appearance by the Police Officer Form',
    description: 'Form for notice of appearance by the police officer.',
    filename: 'Notice for Appearance by the Police Officer.pdf',
    fileSize: '1.8 KB',
    fileType: 'PDF',
    category: 'FORMS',
    language: 'English'
  }
];

export default lawBooklets;