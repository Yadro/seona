
export declare class FractionType {
    "s": number; // знак
    "n": number; // числитель
    "d": number; // знаменатель

    constructor(a, b?);

    /**
     * Returns the actual number without any sign information
     */
    abs(): FractionType;

    /**
     * Returns the actual number with flipped sign in order to get the additive inverse
     */
    neg(): FractionType;

    /**
     * Returns the sum of the actual number and the parameter n
     * @param n
     */
    add(n): FractionType;

    /**
     * Returns the difference of the actual number and the parameter n
     * @param n
     */
    sub(n): FractionType;

    /**
     * Returns the product of the actual number and the parameter n
     * @param n
     */
    mul(n): FractionType;

    /**
     * Returns the quotient of the actual number and the parameter n
     * @param n
     */
    div(n): FractionType;

    /**
     * Returns the power of the actual number, raised to an integer exponent.
     * Note: Rational exponents are planned, but would slow down the function a lot,
     * because of a kinda slow root finding algorithm, whether the result will become irrational.
     * So for now, only integer exponents are implemented.
     * @param exp
     */
    pow(exp): FractionType;

    mod(n): FractionType;

    mod(): FractionType;

    gcd(n): FractionType;

    lcm(n): FractionType;

    ceil(places?): FractionType;

    floor(places?): FractionType;

    round(places?): FractionType;

    /**
     * Returns the multiplicative inverse of the actual number (n / d becomes d / n) in order to get the reciprocal
     */
    inverse(): FractionType;
    equals(n);
    compare(n);
    divisible(n);
    divisible(n);
    toString();
    toLatex(excludeWhole: boolean);
    toFraction();
    toFractionType(excludeWhole: boolean);
    toContinued();
    clone();
}