# Builder-Editor

## How builder-editor works with @pe/feature-flag
Builder has two kinds of restrictions that are handled by feature flags:

* show/hide UI elements
* enable/disable behaviors for selected elements.

#### UI elements
UI elements are handled by addings `*peFeatureFlag` directive to them.

#### Behaviors
Behaviors have more complex logic:
1) every behavior implements method `handleBehaviorStatus`.
It should have logic that turns on/off current behavior depends on some condition.
*Example*: get selected element and check if current behavior is allowed for this element.

2) Feature flags should contain relation between behavior type and element type.
```
{
    name: 'image.resize',
    action: PeFeatureFlagActionEnum.Disable,
    data: {
      behaviorType: PebBehaviorType.resizeElement, // <------
      elementType: PebElementType.Image, // <------
    } as PeFeatureFlagBehaviorData,
},
```

3) After that behavior can check if it is allowed by feature flag via `isBehaviorAllowed` method

### TODOs
* prefer sending cloned objects instead of originals
* combine PebShopource and PebShopnapshot into single entity if possible
