import { describe, expect, it } from 'vitest'
import { round } from '@/patch/math-util'

describe('math-util', () => {
  it('round', () => {
    expect(round(6.123233995736766e-17, 2)).toMatchInlineSnapshot(`0`);
    expect(round(123.456, 2)).toMatchInlineSnapshot(`123.46`);
    expect(round(-123.456, 2)).toMatchInlineSnapshot(`-123.46`);
    expect(round(1.005, 2)).toMatchInlineSnapshot(`1.01`);
    expect(round(1.23456789, 4)).toMatchInlineSnapshot(`1.2346`);
    expect(round(0.000123456, 6)).toMatchInlineSnapshot(`0.000123`);
    expect(round(0.000000000123456, 12)).toMatchInlineSnapshot(`1.23e-10`);
    expect(round(-0.000123456, 6)).toMatchInlineSnapshot(`-0.000123`);
    expect(round(-0.000000000123456, 12)).toMatchInlineSnapshot(`-1.23e-10`);
  })
})
