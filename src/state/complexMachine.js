const PromptMachine = Machine({
  id: 'Prompt',
  initial: 'visible',
  states: {
    visible: {
      on: {
        DISMISS: 'hidden',
        RETRY: sendParent('RETRY'),
      },
    },
    hidden: {
      type: 'final',
    },
  },
});

const selectOneItem = (ctx) =>
  ctx.selectedItemsCount !== ctx.maxItemsCount
    ? ctx.selectedItemsCount + 1
    : ctx.selectedItemsCount;

const selectAllItems = (ctx) => ctx.maxItemsCount;

const deselectOneItem = (ctx) =>
  ctx.selectedItemsCount > 0
    ? ctx.selectedItemsCount - 1
    : ctx.selectedItemsCount;
const deselectAllItems = (ctx) => 0;

const deleteSelectedItems = (ctx) => ctx.maxItemsCount - ctx.selectedItemsCount;
const uploadOneFile = (ctx) => ctx.maxItemsCount + 1;

const StateMachine = Machine(
  {
    id: 'Browser',
    initial: 'browsing',
    context: {
      selectedItemsCount: 0,
      maxItemsCount: 5,
    },
    states: {
      browsing: {
        on: {
          '': {
            target: 'selecting',
            cond: 'atLeastOneSelected',
          },
          SELECT_ITEM: {
            target: 'selecting',
            actions: 'selectAnItem',
            cond: 'validFileCount',
          },
          SELECT_ALL_ITEMS: {
            target: 'selecting',
            actions: 'selectAllItems',
            cond: 'validFileCount',
          },
          UPLOAD_FILE: {
            target: 'browsing',
            actions: 'addOneFile',
          },
        },
      },
      selecting: {
        on: {
          '': {
            target: 'browsing',
            cond: 'invalidFileCount',
          },
          SELECT_ITEM: {
            target: 'selecting',
            actions: 'selectAnItem',
          },
          SELECT_ALL_ITEMS: {
            target: 'selecting',
            actions: 'selectAllItems',
          },
          DESELECT_ALL_ITEMS: {
            target: 'browsing',
            actions: 'deselectAllItems',
          },
          DESELECT_ITEM: [
            {
              target: 'browsing',
              cond: (ctx) => ctx.selectedItemsCount === 1,
              actions: 'deselectAnItem',
            },
            {
              target: 'selecting',
              actions: 'deselectAnItem',
            },
          ],
          DELETE_SELECTED_ITEMS: 'deleting',
        },
      },
      deleting: {
        on: {
          SUCCESS: {
            target: 'browsing',
            actions: 'deleteSelectedItems',
          },
          ERROR: 'prompting',
        },
      },
      prompting: {
        invoke: {
          id: 'promptMachine',
          src: PromptMachine,
          onDone: 'selecting',
        },
        on: {
          RETRY: 'deleting',
        },
      },
    },
  },
  {
    actions: {
      selectAnItem: assign({
        selectedItemsCount: selectOneItem,
      }),
      selectAllItems: assign({
        selectedItemsCount: selectAllItems,
      }),
      deselectAnItem: assign({
        selectedItemsCount: deselectOneItem,
      }),
      deselectAllItems: assign({
        selectedItemsCount: deselectAllItems,
      }),
      deleteSelectedItems: assign({
        selectedItemsCount: 0,
        maxItemsCount: deleteSelectedItems,
      }),
      addOneFile: assign({
        maxItemsCount: uploadOneFile,
      }),
    },
    guards: {
      validFileCount: (ctx) => ctx.maxItemsCount > 0,
      invalidFileCount: (ctx) => ctx.maxItemsCount <= 0,
      atLeastOneSelected: (ctx) => ctx.selectedItemsCount >= 1,
    },
  }
);
