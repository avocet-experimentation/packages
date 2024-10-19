import {
  EnvironmentName,
  FeatureFlagContent,
  FlagName,
  UserGroupName,
} from "@fflags/types";

import { Model, model, Schema } from "mongoose";

// types

export type FeatureFlagContentInDB = FeatureFlagContent;

export type UserGroupsInDB = {
  userGroups: Map<UserGroupName, FeatureFlagContentInDB>;
};

export type FeatureFlagInDB = {
  name: FlagName;
  description: string;
  environments: Map<EnvironmentName, UserGroupsInDB>;
};

export type FeatureFlagDocument = FeatureFlagInDB & Document;

// schemas

// use generics to enforce that this schema is type checked
const flagContentScheme = new Schema<FeatureFlagContentInDB>(
  {
    enabled: { type: Boolean, defaul: false },
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
      of: flagContentScheme,
    },
  },
  {
    _id: false,
  }
);

const fflagsSchema = new Schema<FeatureFlagInDB>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    environments: {
      type: Map,
      of: userGroupsSchema,
    },
  },
  {
    _id: true,
    timestamps: true, // of both creation and latest update
  }
);

export const FFlagModel: Model<FeatureFlagDocument> =
  model<FeatureFlagDocument>("fflags", fflagsSchema);
