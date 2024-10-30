import { beforeAll, describe, expect, test } from "vitest";
import { FeatureFlagContent, FeatureFlags, FlagName, UserGroupName, UserGroups } from '../src/index.js';

describe('fflagsTypes', () => {
  let flags: FeatureFlags;

  const mockUserGroups = (newAccess: boolean, oldAccess: boolean): UserGroups => ({
    newFeatureAccess: {
      enabled: newAccess,
    },
    oldFeatureAccess: {
      enabled: oldAccess,
    },
  });

  const mockFeatureFlags = (): FeatureFlags => {
    const flags: FeatureFlags = new Map<FlagName, UserGroups>()
    flags.set('flagOne', mockUserGroups(true, false));
    flags.set('flagTwo', mockUserGroups(false, true));
    return flags;
  };

  const getFlag = (flagName: FlagName, userGroupName: UserGroupName): FeatureFlagContent | undefined => {
    const groups = flags.get(flagName);
    return groups ? groups[userGroupName] : undefined;
  }

  beforeAll(() => {
    flags = mockFeatureFlags();
  });

  test('Should retrieve an existing flag from the cached data', () => {
    const actualOne = getFlag('flagOne', 'newFeatureAccess');
    const actualTwo = getFlag('flagOne', 'oldFeatureAccess');
    const actualThree = getFlag('flagTwo', 'newFeatureAccess');
    const actualFour = getFlag('flagTwo', 'oldFeatureAccess');
    expect(actualOne).eql({ enabled: true });
    expect(actualTwo).eql({ enabled: false });
    expect(actualThree).eql({ enabled: false });
    expect(actualFour).eql({ enabled: true });
  });

  test('Should fail to retrieve a non-existing flag from the cached data', () => {
    const actualOne = getFlag('flag', 'newFeatureAccess');
    const actualTwo = getFlag('flag', 'oldFeatureAccess');
    expect(actualOne).undefined;
    expect(actualTwo).undefined;
  });

  test('Should fail to retrieve a flag using a non-existent group', () => {
    const actualOne = getFlag('flagOne', 'featureAccess');
    const actualTwo = getFlag('flagOne', 'featureAccess');
    expect(actualOne).undefined;
    expect(actualTwo).undefined;
  });
})