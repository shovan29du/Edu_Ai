import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FactOfTheDay from '../src/components/FactOfTheDay.jsx';
import { ChildProvider } from '../src/contexts/ChildContext.jsx';

const grade = {
  subjects: {
    Math: {
      info_cards: [{ title: 'Did You Know?', fact: 'Zero is an even number.', safe: true }],
    },
    Music: {
      info_cards: [{ title: 'Did You Know?', fact: 'The piano has 88 keys.', safe: true }],
    },
  },
};

describe('FactOfTheDay', () => {
  it('renders a fact pulled from one of the grade subjects', () => {
    render(
      <ChildProvider>
        <FactOfTheDay grade={grade} />
      </ChildProvider>
    );
    expect(screen.getByText(/Fact of the Day/)).toBeInTheDocument();
    const facts = ['Zero is an even number.', 'The piano has 88 keys.'];
    const shown = facts.some((f) => screen.queryByText(f));
    expect(shown).toBe(true);
  });

  it('renders nothing when there are no info cards', () => {
    const { container } = render(
      <ChildProvider>
        <FactOfTheDay grade={{ subjects: { Math: { info_cards: [] } } }} />
      </ChildProvider>
    );
    expect(container).toBeEmptyDOMElement();
  });
});
