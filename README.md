# Quest

A modular questline management system built with TypeScript and React. 
Easily define, manage, and visualize complex quest dependencies for games or gamified applications.

> [!NOTE]
> Check out the wiki for detailed documentation on how to use and extend the quest system.

## Features

- **Composable Questlines:** Define quests and dependencies using a flexible schema.
- **Recursive Logic:** Supports complex, nested requirements and cascading quest states.
- **Validation & Testing:** Built-in guidelines for robust quest logic and UI testing.
- **Responsive UI:** Works seamlessly across desktop and mobile devices.

## Usage

- Browse and interact with questlines in the UI.
- Add or modify quests by editing files in `components/quests/`.
- All quest logic is defined in TypeScript for type safety and maintainability.

## Contributing

### Adding New Questlines

1. Create a new TypeScript file in `components/quests/`
2. Define your questline following the schema
3. Export it as a named export
4. Import and add to the main data array in `all_quests.tsx`

### Modifying Existing Quests

1. Locate the appropriate questline file
2. Update quest data following schema guidelines
3. Ensure all validation passes
4. Test complex logic conditions and recursive scenarios thoroughly

### Testing Guidelines

1. **Dependency Testing:** Verify requirement chains work as expected
2. **Logic Testing:** Test all boolean conditions with various quest states
3. **Recursive Must Requirement Testing:** Test cascading failure scenarios thoroughly, including deep chains
4. **Edge Case Testing:** Test unusual combinations of quest states
5. **UI Testing:** Ensure changes display correctly in all views
6. **Mobile Testing:** Verify responsive behavior on mobile devices
7. **Performance Testing:** Test system performance with complex recursive scenarios

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

> [!TIP]
> *For technical support or questions about quest design, please refer to the comprehensive examples above or examine the existing quest files in the codebase with help from the below guide.*
