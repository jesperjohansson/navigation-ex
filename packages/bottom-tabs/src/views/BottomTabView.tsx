import * as React from 'react';
import { View, StyleSheet } from 'react-native';

import { TabNavigationState } from '@react-navigation/routers';
import { useTheme } from '@react-navigation/native';
// eslint-disable-next-line import/no-unresolved
import { ScreenContainer } from 'react-native-screens';

import SafeAreaProviderCompat from './SafeAreaProviderCompat';
import ResourceSavingScene from './ResourceSavingScene';
import BottomTabBar from './BottomTabBar';
import {
  BottomTabNavigationConfig,
  BottomTabDescriptorMap,
  BottomTabNavigationHelpers,
  BottomTabBarProps,
} from '../types';

type Props = BottomTabNavigationConfig & {
  state: TabNavigationState;
  navigation: BottomTabNavigationHelpers;
  descriptors: BottomTabDescriptorMap;
};

type State = {
  loaded: number[];
};

function SceneContent({
  isFocused,
  children,
}: {
  isFocused: boolean;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <View
      accessibilityElementsHidden={!isFocused}
      importantForAccessibility={isFocused ? 'auto' : 'no-hide-descendants'}
      style={[styles.content, { backgroundColor: colors.background }]}
    >
      {children}
    </View>
  );
}

export default class BottomTabView extends React.Component<Props, State> {
  static defaultProps = {
    lazy: true,
  };

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    const { index } = nextProps.state;

    return {
      // Set the current tab to be loaded if it was not loaded before
      loaded: prevState.loaded.includes(index)
        ? prevState.loaded
        : [...prevState.loaded, index],
    };
  }

  state = {
    loaded: [this.props.state.index],
  };

  private renderTabBar = () => {
    const {
      tabBar = (props: BottomTabBarProps) => <BottomTabBar {...props} />,
      tabBarOptions,
      state,
      navigation,
    } = this.props;

    const { descriptors } = this.props;
    const route = state.routes[state.index];
    const descriptor = descriptors[route.key];
    const options = descriptor.options;

    if (options.tabBarVisible === false) {
      return null;
    }

    return tabBar({
      ...tabBarOptions,
      state: state,
      descriptors: descriptors,
      navigation: navigation,
    });
  };

  render() {
    const { state, descriptors, lazy, unmountInactiveScreens } = this.props;
    const { routes } = state;
    const { loaded } = this.state;

    return (
      <SafeAreaProviderCompat>
        <View style={styles.container}>
          <ScreenContainer style={styles.pages}>
            {routes.map((route, index) => {
              if (unmountInactiveScreens && index !== state.index) {
                return null;
              }

              if (lazy && !loaded.includes(index)) {
                // Don't render a screen if we've never navigated to it
                return null;
              }

              const isFocused = state.index === index;

              return (
                <ResourceSavingScene
                  key={route.key}
                  style={StyleSheet.absoluteFill}
                  isVisible={isFocused}
                >
                  <SceneContent isFocused={isFocused}>
                    {descriptors[route.key].render()}
                  </SceneContent>
                </ResourceSavingScene>
              );
            })}
          </ScreenContainer>
          {this.renderTabBar()}
        </View>
      </SafeAreaProviderCompat>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  pages: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
