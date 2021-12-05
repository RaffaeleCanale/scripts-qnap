import Joi, {
    ArraySchema,
    BooleanSchema,
    NumberSchema,
    ObjectSchema,
    Schema,
    StringSchema,
} from 'joi';

type JoiObjectValidator<T> = {
    [K in keyof T]: T[K] extends string
        ? StringSchema
        : T[K] extends number
        ? NumberSchema
        : T[K] extends boolean
        ? BooleanSchema
        : T[K] extends unknown[]
        ? ArraySchema
        : T[K] extends Record<string, unknown>
        ? ObjectSchema<T[K]>
        : Schema;
};

/**
 * Create a Joi validator for a given type of object.
 *
 * @param keys Validation for each of the object's keys
 */
export function objSchema<T>(keys: JoiObjectValidator<T>): ObjectSchema<T> {
    return Joi.object<T>().required().keys(keys);
}

/**
 * Validates a Joi object. If the validation fails, an error is thrown.
 *
 * @param obj Object to validate.
 * @param schema Schema of the object.
 * @param name (Optional) name of the object used to show a more informative error message.
 */
export function validate<T>(
    obj: unknown,
    schema: ObjectSchema<T>,
    name?: string,
): T;
export function validate(obj: unknown, schema: Schema, name?: string): unknown {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { error, value } = schema.validate(obj);
    if (error) {
        const message = name
            ? `Validation failed for ${name}: ${error.message}`
            : `Validation failed: ${error.message}`;
        throw new Error(message);
    }
    return value as unknown;
}
