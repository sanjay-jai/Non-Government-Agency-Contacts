export interface ContactRecord {
  sNo: string;
  agency: string;
  location: string;
  ownerName: string;
  registrationNumber: string;
  currentAddress: string;
  mobileNumber: string;
  streetName: string;
}

export interface FilterState {
  agency: string;
  location: string;
  streetName: string;
}
