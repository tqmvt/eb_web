import React from 'react';
import { useRouter } from 'next/router';
import useFeatureFlag from '../../hooks/useFeatureFlag';
const FeatureFlagPage = ({ children, feature, component: Component }) => {

  const { replace } = useRouter();
  
  const isPageEnabled = useFeatureFlag(feature);

  React.useEffect(() => {
    if (!isPageEnabled) {
      replace('/');
    }
  }, [])

  return isPageEnabled
    ? Component
      ? <Component />
      : children
    : null;
}

export default FeatureFlagPage;