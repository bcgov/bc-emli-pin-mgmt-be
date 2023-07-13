// Basic file to check if tests are working as expected

describe('Sample tests', () => {
    test('Sample test', () => {
        const a: number = 2,
            b: number = 3
        expect(a).toBe(2)
        expect(b).toBe(3)
        expect(a).not.toEqual(b)
    })
})
