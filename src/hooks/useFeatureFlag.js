import { featureFlags } from '../Config';

const useFeatureFlag = (feature) => {
  const isEnabled = featureFlags[feature];

  return isEnabled;
};

export default useFeatureFlag;