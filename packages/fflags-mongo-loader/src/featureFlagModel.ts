import {
  EnvironmentName,
  FeatureFlagContent,
  FlagName,
  UserGroupName,
} from "@fflags/types";

import { Model, model, Schema, Document } from "mongoose";

// types

export type FeatureFlagContentInDB = FeatureFlagContent;

export type UserGroupsInDB = {
  userGroups: Map<UserGroupName, FeatureFlagContentInDB>;
};

export type FeatureFlagInDB = {
  id: string;
  name: FlagName;
  description: string;
  environments: Map<EnvironmentName, UserGroupsInDB>;
  createdAt: Date;
  updatedAt: Date;
};

export type FeatureFlagDocument = FeatureFlagInDB & Document;

// schemas

// use generics to enforce that this schema is type checked
const flagContentSchema = new Schema<FeatureFlagContentInDB>(
  {
    enabled: { type: Boolean, default: false },
    value: { type: Object },
  },
  {
    _id: false,
  }
);

const userGroupsSchema = new Schema<UserGroupsInDB>(
  {
    userGroups: {
      type: Map, // database will have a unique property key for each flag's content => when reading, mongoose creates a hashmap of this object for us
      of: flagContentSchema,
    },
  },
  {
    _id: false,
  }
);

/*
Description:
  In mongoose, a `transform` function is used to modify the representation of a document
  when it is converted to JSON
Parameters:
  - `doc` => represents the Mongoose document being transformed
    - gives access to document's properties and methods
  - `ret` => represents the transformed object that will be returned
    - we can pass parameters to the `ret` object to shape the final transformed output
Function:
  Used to have a more readable object by changing the identifier type and
  removing the internal version field.
*/
const transform = (doc: any, ret: any): FeatureFlagInDB => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
};

const fflagsSchema = new Schema<FeatureFlagInDB>(
  {
    name: { type: String, unique: true, required: true }, // unique constraint ensures no two flags with the same name
    description: { type: String, required: true },
    environments: {
      type: Map,
      of: userGroupsSchema,
    },
  },
  {
    _id: true,
    timestamps: true, // of both creation and latest update
    toJSON: { transform },
  }
);

export const FFlagModel: Model<FeatureFlagInDB> = model<FeatureFlagInDB>(
  "fflags",
  fflagsSchema
);
