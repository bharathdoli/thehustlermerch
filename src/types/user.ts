export type UserRole = "Customer" | "Admin";

export type User = {
  uid: string;
  uname: string;
  email: string;
  phoneNo: string;
  role: UserRole;
  createdAt: string;
};

export type Address = {
  addressId: string;
  userId: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
};  