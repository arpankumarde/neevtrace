import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface CompanyDoc {
  registrationDoc?: string;
  taxDoc?: string;
}

const SupplierSchema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String },
    avatar: { type: String, default: "" },
    companyDocs: {
      registrationDoc: { type: String },
      taxDoc: { type: String },
    },
    complianceDoc: {
      esg: { type: String },
      iso: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Supplier ||
  mongoose.model("Supplier", SupplierSchema);
