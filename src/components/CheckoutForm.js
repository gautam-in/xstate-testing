import React, { useState } from 'react';
import { useMachine } from '@xstate/react';
import stateMachine from '../state';

const CheckoutForm = () => {
  const [machine, send] = useMachine(stateMachine);
  const [form, updateForm] = useState({
    name: '',
    card: '',
  });
  console.log(machine.value);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send({ type: 'SUBMIT', data: { ...form } });
        console.log(`onSubmit`, machine.value);
      }}
    >
      <h1>XState Payment Form</h1>
      {machine.matches('error') ? (
        <p>
          {machine.context.msg !== ''
            ? machine.context.msg
            : 'Oops! No error message!'}
        </p>
      ) : null}
      {machine.matches('success') ? (
        <p>
          {machine.context.msg !== ''
            ? machine.context.msg
            : 'Your payment succeeded!'}
        </p>
      ) : null}
      <p>
        <label htmlFor="nameOnCard">
          Name on Card <abbr title="Required">*</abbr>
        </label>
        <input
          type="text"
          id="nameOnCard"
          name="nameNnCard"
          placeholder="John Doe"
          value={form.name}
          onChange={(e) => updateForm({ ...form, name: e.target.value })}
        />
      </p>
      <p>
        <label htmlFor="creditCardNumber">
          Card Number <abbr title="Required">*</abbr>
        </label>
        <input
          type="text"
          name="creditCardNumber"
          id="creditCardNumber"
          placeholder="1234567890123456"
          value={form.card}
          onChange={(e) => updateForm({ ...form, card: e.target.value })}
        />
      </p>
      <p>
        <input type="submit" value="Pay Now" />
      </p>
    </form>
  );
};
export default CheckoutForm;
