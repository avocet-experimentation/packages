import {
  FlagContent,
  FlagEnvironment,
  FlagEnvironmentName,
  FlagName,
} from "@fflags/types";

import { Model, model, Schema } from "mongoose";

export type EnvironmentsMap = Map<FlagEnvironmentName, FlagEnvironment>;

export type FeatureFlagsInDB = Map<FlagName, FlagContentInDB>;

export type FlagContentInDB = {
  name: string;
  environments: EnvironmentsMap;
} & ( //indicates the active state when the flag is enabled.
  | { valueType: "boolean"; defaultValue: boolean } //
  | { valueType: "string"; defaultValue: string }
  | { valueType: "number"; defaultValue: number }
);

/**
 * Modify the representation of a document when it is converted to JSON. Useful for creating a more readable object by changing/removing certain properties of the original document.
 * @param doc The Mongoose document being transformed. It gives access to the document's properties and methods.
 * @param ret The resulting transformed object. Passing parameters to this object will shape the final transformed output.
 * @returns Modified document.
 */
const transform = (doc: any, ret: any): FlagContent => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
};

// use generics to enforce that this schema is type checked
const fflagsSchema = new Schema<FlagContent>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
    environments: {
      type: Map,
      of: Boolean, // each environment name maps to an enabled state (boolean)
      required: true,
    },
    valueType: {
      type: String,
      enum: ["boolean", "string", "number"],
      required: true,
    },
    defaultValue: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function (value) {
          const { valueType } = this;
          if (valueType === "boolean") return typeof value === "boolean";
          if (valueType === "string") return typeof value === "string";
          if (valueType === "number") return typeof value === "number";
          return false;
        },
        message: (props) => `Invalid default value for type ${props.value}`,
      },
    },
  },
  {
    _id: true,
    timestamps: true, // of both creation and latest update
    toJSON: { transform },
  }
);

export const FFlagModel: Model<FlagContent> = model<FlagContent>(
  "fflags",
  fflagsSchema
);
