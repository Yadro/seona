
export declare class Fraction {
    "s": number; // знак
    "n": number; // числитель
    "d": number; // знаменатель
    constructor(a, b?);

    abs(): Fraction;
    neg(): Fraction;
    add(n): Fraction;
    sub(n): Fraction;
    mul(n): Fraction;
    div(n): Fraction;
    pow(exp): Fraction;
    mod(n): Fraction;
    mod(): Fraction;
    gcd(n): Fraction;
    lcm(n): Fraction;
    ceil(places?): Fraction;
    floor(places?): Fraction;
    round(places?): Fraction;
    inverse(): Fraction;
    equals(n);
    compare(n);
    divisible(n);
    divisible(n);
    toString();
    toLatex(excludeWhole: boolean);
    toFraction(excludeWhole: boolean);
    toContinued();
    clone();
}