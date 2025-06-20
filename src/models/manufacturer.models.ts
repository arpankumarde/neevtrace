import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface CompanyDoc {
  registrationDoc?: string;
  taxDoc?: string;
}

const ManufacturerSchema = new Schema(
  {
    user_id: { type: String, required: true },
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
    batches: [
      {
        batchNumber: { type: String, required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        productionDate: { type: Date, required: true },
        expiryDate: { type: Date },
        complianceDocs: {
          ciipl: { type: String },
          iso: { type: String },
          bis: { type: String },
          rohs: { type: String },
        },
      },
    ],
    
  },
  { timestamps: true }
);

export default mongoose.models.Manufacturer ||
  mongoose.model("Manufacturer", ManufacturerSchema);
