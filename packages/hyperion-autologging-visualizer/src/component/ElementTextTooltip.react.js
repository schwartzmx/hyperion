/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
import React from "react";
let _channell = null;
export function init(options) {
    _channell = options.channel;
}
export function ElementTextTooltip(props) {
    const channel = props.channel ?? _channell;
    const [label, setLabel] = React.useState('');
    if (channel) {
        React.useEffect(() => {
            const listener = channel.addListener('al_ui_event', event => {
                const { elementText } = event;
                if (elementText) {
                    setLabel(`${elementText.source}:${elementText.text}`);
                }
            });
            return () => {
                channel.removeListener('al_ui_event', listener);
            };
        });
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", null,
            React.createElement("label", null, label)),
        props.children));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRWxlbWVudFRleHRUb29sdGlwLnJlYWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRWxlbWVudFRleHRUb29sdGlwLnJlYWN0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUtILE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQVExQixJQUFJLFNBQVMsR0FBa0MsSUFBSSxDQUFDO0FBQ3BELE1BQU0sVUFBVSxJQUFJLENBQUMsT0FBb0I7SUFDdkMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7QUFDOUIsQ0FBQztBQU1ELE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxLQUFZO0lBQzdDLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLElBQUksU0FBUyxDQUFDO0lBQzNDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBUyxFQUFFLENBQUMsQ0FBQztJQUNyRCxJQUFJLE9BQU8sRUFBRTtRQUNYLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ25CLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxFQUFFO2dCQUMxRCxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsS0FBSyxDQUFDO2dCQUM5QixJQUFJLFdBQVcsRUFBRTtvQkFDZixRQUFRLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2lCQUN2RDtZQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxHQUFHLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDbEQsQ0FBQyxDQUFBO1FBQ0gsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUNELE9BQU8sQ0FBQztRQUNOO1lBQ0UsbUNBQVEsS0FBSyxDQUFTLENBQ2xCO1FBQ0wsS0FBSyxDQUFDLFFBQVEsQ0FDZCxDQUFDLENBQUM7QUFDUCxDQUFDIn0=