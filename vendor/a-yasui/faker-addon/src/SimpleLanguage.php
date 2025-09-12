<?php

declare(strict_types=1);

namespace Ayasui\FakerAddon\Provider;

class SimpleLanguage extends Base
{
    public static function __convert_unicode_jp(int $code)
    {
        return mb_convert_encoding('&#' . intval($code) . ';', 'UTF-8', 'HTML-ENTITIES');
    }

    public static function __makeString(array $words, int $wordcount): string
    {
        $result = [];
        for ($i = 0; $i < $wordcount; $i++) {
            $result[] = static::__convert_unicode_jp(static::randomElement($words));
        }
        return implode('', $result);
    }

    /**
     * 一般的な全角ひらがな
     *
     * @example 'ひらぱな'
     */
    public static function hira_gana(int $wordcount = 4)
    {
        if ($wordcount < 1) {
            throw new \InvalidArgumentException('Word count must be greater than 0');
        }

        // あいうえお
        $words = [
            0x3042,
            0x3044,
            0x3046,
            0x3048,
            0x304A,
        ];
        // が〜わ(0x304B → 0x308D)までは有効
        $words = array_merge($words, range(0x304B, 0x308D));
        $words[] = 0x308F; // わ
        $words[] = 0x3092; // を
        $words[] = 0x3093; // ん

        // hiragana code is range u+3041 => U+3041
        return static::__makeString($words, $wordcount);
    }

    /**
     * 一般的な全角ひらがな
     * *
     * * @example 'ひらぱな'
     */
    public static function zenkaku_hira_gana(int $wordcount = 4)
    {
        return static::hira_gana($wordcount);
    }

    /**
     * 広域な全角ひらがな
     *
     * @see https://www.unicode.org/charts/
     *
     * @example 'わゔぁあぃいぅうぇえぉおかが'
     */
    public static function full_zenkaku_hira_gana(int $wordcount = 4)
    {
        if ($wordcount < 1) {
            throw new \InvalidArgumentException('Word count must be greater than 0');
        }

        // あ〜ん(0x3041 → 0x3096)まで有効
        $words = range(0x3041, 0x3096);
        // ゝ,ゞ,ゟ(0x309D → 0x309F)も有効
        $words = array_merge($words, range(0x309D, 0x309F));

        // 変体はとりあえずコメントアウト。まだOS等が未対応のため、使う事がまずない。
        // 𛀀(0x1B000) 〜 (1B0FF) までの変体有効
//        $words = array_merge($words, range(0x1B000, 0x1B0FF));

        // (0x1B100) 〜 (1B122) までの変体有効
//        $words = array_merge($words, range(0x1B100, 0x1B122));

        return static::__makeString($words, $wordcount);
    }

    /**
     * @example 'カタカナ'
     */
    public static function kata_kana(int $wordcount = 4)
    {
        if ($wordcount < 1) {
            throw new \InvalidArgumentException('Word count must be greater than 0');
        }

        // アイウエオ(0x30A2, 0x30A4, 0x30A6, 0x30A8, 0x30AA)まで有効
        $words = [0x30A2, 0x30A4, 0x30A6, 0x30A8, 0x30AA];
        // カ〜ン(0x30AB → 0x30CD)まで有効
        $words = array_merge($words, range(0x30AB, 0x30CD));

        return static::__makeString($words, $wordcount);
    }

    /**
     * @example 'カタカナ'
     */
    public static function zenkaku_kata_kana(int $wordcount = 4)
    {
        return static::kata_kana($wordcount);
    }

    /**
     * 広域な全角カタカナ
     *
     * @example 'ヲァィゥェォカガキギ'
     */
    public static function full_zenkaku_kata_kana(int $wordcount = 4)
    {
        if ($wordcount < 1) {
            throw new \InvalidArgumentException('Word count must be greater than 0');
        }

        // ア〜ヺ(0x30A1 → 0x30FA)まで有効
        $words = range(0x30A1, 0x30FA);
        $words[] = 0x30FD; // ヽ
        $words[] = 0x30FE; // ヾ
        $words[] = 0x30FF; // ヿ

        return static::__makeString($words, $wordcount);
    }

    /**
     * よく使う半角カタカナ
     *
     * @example ｧｱｲｳｴｵｶｷｸｹｺ
     */
    public static function han_kata_kana(int $wordcount = 4)
    {
        if($wordcount < 1) {
            throw new \InvalidArgumentException('Word count must be greater than 0');
        }

        // ｱ(0xFF71) 〜 ﾝ(0xFF9D) まで有効
        $words = range(0xFF71, 0xFF9D);
        $words[] = 0xFF66; // ｦ
        return static::__makeString($words, $wordcount);
    }

    /**
     * あんまり使わない半角カタカナ
     *
     * @example 'ｧｾﾉｾｰﾀｨｼﾘﾅ'
     */
    public static function full_han_kata_kana(int $wordcount = 4)
    {
        if($wordcount < 1) {
            throw new \InvalidArgumentException('Word count must be greater than 0');
        }

        // ｦ(0xFF66) 〜 ﾝ(0xFF9D) まで有効
        $words = range(0xFF66, 0xFF9D);
        return static::__makeString($words, $wordcount);
    }

    /**
     * @example 'abcdef'
     */
    public static function alphabet(int $wordcount = 1)
    {
        if($wordcount < 1) {
            throw new \InvalidArgumentException('Word count must be greater than 0');
        }

        // a-zA-Z
        $words = range(0x41, 0x5A);
        $words = array_merge($words, range(0x61, 0x7A));

        return static::__makeString($words, $wordcount);
    }

    /**
     * @example 'abcdef123'
     */
    public static function alphabet_with_number(int $wordcount = 1)
    {
        if($wordcount < 1) {
            throw new \InvalidArgumentException('Word count must be greater than 0');
        }

        // a-zA-Z0-9
        $words = range(0x41, 0x5A);
        $words = array_merge($words, range(0x61, 0x7A));
        $words = array_merge($words, range(0x30, 0x39));

        return static::__makeString($words, $wordcount);
    }

    /**
     * 大文字小文字を含めた全角アルファベット
     */
    public static function zenkaku_alphabet(int $wordcount = 1)
    {
        if($wordcount < 1) {
            throw new \InvalidArgumentException('Word count must be greater than 0');
        }

        // 0xFF21 → 0xFF3A, 0xFF41 → 0xFF5A
        $words = range(0xFF21, 0xFF3A);
        $words = array_merge($words, range(0xFF41, 0xFF5A));
        return static::__makeString($words, $wordcount);
    }

    public static function zenkaku_alphabet_with_number(int $wordcount =1)
    {
        if($wordcount < 1) {
            throw new \InvalidArgumentException('Word count must be greater than 0');
        }

        // 0xFF21 → 0xFF3A, 0xFF41 → 0xFF5A, 0xFF10 → 0xFF19
        $words = range(0xFF21, 0xFF3A);
        $words = array_merge($words, range(0xFF41, 0xFF5A));
        $words = array_merge($words, range(0xFF10, 0xFF19));
        return static::__makeString($words, $wordcount);
    }

}