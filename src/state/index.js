import { Machine, assign } from 'xstate';

function fakePayment(name, card) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      isNaN(card)
        ? reject('Error in Card Number')
        : resolve('Payment Processed');
    }, 500);
  });
}

const stateMachine = Machine({
  initial: 'idle',
  context: {
    msg: '',
  },
  states: {
    idle: {
      on: {
        SUBMIT: [
          {
            target: 'loading',
            cond: (ctx, event) =>
              event.data.name !== '' && event.data.card !== '',
          },
          {
            target: 'error',
          },
        ],
      },
    },
    loading: {
      invoke: {
        id: 'doPayment',
        src: (ctx, { data: { name, card } }) => fakePayment(name, card),
        onDone: {
          target: 'success',
          actions: assign({ msg: (ctx, event) => event.data }),
        },
        onError: {
          target: 'error',
          actions: assign({ msg: (ctx, event) => event.data }),
        },
      },
    },
    error: {
      on: {
        SUBMIT: [
          {
            target: 'loading',
            cond: (ctx, event) =>
              event.data.name !== '' && event.data.card !== '',
          },
        ],
      },
    },
    success: {
      type: 'final',
    },
  },
});

export default stateMachine;
