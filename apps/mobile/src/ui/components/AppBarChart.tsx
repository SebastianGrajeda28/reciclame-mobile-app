import { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BarChart, barDataItem, BarChartPropsType } from 'react-native-gifted-charts';

import { theme } from '@/src/ui/theme';

type AppBarChartProps = {
  data: readonly barDataItem[];
  maxValue?: number;
  horizontal?: boolean;
  height?: number;
  barWidth?: number;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
  chartProps?: Partial<BarChartPropsType>;
};

export function AppBarChart({
  data,
  maxValue,
  horizontal = false,
  height = 120,
  barWidth = 12,
  spacing = theme.spacing.s2,
  style,
  chartProps,
}: AppBarChartProps) {
  const [parentWidth, setParentWidth] = useState(0);
  const resolvedData = useMemo(() => [...data], [data]);

  function handleLayout(event: LayoutChangeEvent) {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth !== parentWidth) {
      setParentWidth(nextWidth);
    }
  }

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      {parentWidth > 0 ? (
        <BarChart
          data={resolvedData}
          maxValue={maxValue}
          horizontal={horizontal}
          height={height}
          barWidth={barWidth}
          spacing={spacing}
          initialSpacing={0}
          endSpacing={0}
          parentWidth={parentWidth}
          adjustToWidth
          disablePress
          disableScroll
          showScrollIndicator={false}
          hideRules
          hideAxesAndRules
          hideYAxisText
          hideOrigin
          xAxisThickness={0}
          yAxisThickness={0}
          xAxisLabelsHeight={0}
          yAxisLabelWidth={0}
          xAxisTextNumberOfLines={1}
          roundedTop
          roundedBottom
          barBorderRadius={theme.radius.full}
          {...chartProps}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
