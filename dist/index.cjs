"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc4) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc4 = __getOwnPropDesc(from, key)) || desc4.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// shared/models/auth.ts
var import_drizzle_orm, import_pg_core, sessions, users;
var init_auth = __esm({
  "shared/models/auth.ts"() {
    "use strict";
    import_drizzle_orm = require("drizzle-orm");
    import_pg_core = require("drizzle-orm/pg-core");
    sessions = (0, import_pg_core.pgTable)(
      "sessions",
      {
        sid: (0, import_pg_core.varchar)("sid").primaryKey(),
        sess: (0, import_pg_core.jsonb)("sess").notNull(),
        expire: (0, import_pg_core.timestamp)("expire").notNull()
      },
      (table) => [(0, import_pg_core.index)("IDX_session_expire").on(table.expire)]
    );
    users = (0, import_pg_core.pgTable)("users", {
      id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
      email: (0, import_pg_core.varchar)("email").unique(),
      firstName: (0, import_pg_core.varchar)("first_name"),
      lastName: (0, import_pg_core.varchar)("last_name"),
      profileImageUrl: (0, import_pg_core.varchar)("profile_image_url"),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
  }
});

// ../node_modules/zod/v3/helpers/util.js
var util, objectUtil, ZodParsedType, getParsedType;
var init_util = __esm({
  "../node_modules/zod/v3/helpers/util.js"() {
    (function(util2) {
      util2.assertEqual = (_) => {
      };
      function assertIs(_arg) {
      }
      util2.assertIs = assertIs;
      function assertNever(_x) {
        throw new Error();
      }
      util2.assertNever = assertNever;
      util2.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
          obj[item] = item;
        }
        return obj;
      };
      util2.getValidEnumValues = (obj) => {
        const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
          filtered[k] = obj[k];
        }
        return util2.objectValues(filtered);
      };
      util2.objectValues = (obj) => {
        return util2.objectKeys(obj).map(function(e) {
          return obj[e];
        });
      };
      util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
        const keys = [];
        for (const key in object) {
          if (Object.prototype.hasOwnProperty.call(object, key)) {
            keys.push(key);
          }
        }
        return keys;
      };
      util2.find = (arr, checker) => {
        for (const item of arr) {
          if (checker(item))
            return item;
        }
        return void 0;
      };
      util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
      function joinValues(array, separator = " | ") {
        return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
      }
      util2.joinValues = joinValues;
      util2.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      };
    })(util || (util = {}));
    (function(objectUtil2) {
      objectUtil2.mergeShapes = (first, second) => {
        return {
          ...first,
          ...second
          // second overwrites first
        };
      };
    })(objectUtil || (objectUtil = {}));
    ZodParsedType = util.arrayToEnum([
      "string",
      "nan",
      "number",
      "integer",
      "float",
      "boolean",
      "date",
      "bigint",
      "symbol",
      "function",
      "undefined",
      "null",
      "array",
      "object",
      "unknown",
      "promise",
      "void",
      "never",
      "map",
      "set"
    ]);
    getParsedType = (data) => {
      const t = typeof data;
      switch (t) {
        case "undefined":
          return ZodParsedType.undefined;
        case "string":
          return ZodParsedType.string;
        case "number":
          return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
        case "boolean":
          return ZodParsedType.boolean;
        case "function":
          return ZodParsedType.function;
        case "bigint":
          return ZodParsedType.bigint;
        case "symbol":
          return ZodParsedType.symbol;
        case "object":
          if (Array.isArray(data)) {
            return ZodParsedType.array;
          }
          if (data === null) {
            return ZodParsedType.null;
          }
          if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
            return ZodParsedType.promise;
          }
          if (typeof Map !== "undefined" && data instanceof Map) {
            return ZodParsedType.map;
          }
          if (typeof Set !== "undefined" && data instanceof Set) {
            return ZodParsedType.set;
          }
          if (typeof Date !== "undefined" && data instanceof Date) {
            return ZodParsedType.date;
          }
          return ZodParsedType.object;
        default:
          return ZodParsedType.unknown;
      }
    };
  }
});

// ../node_modules/zod/v3/ZodError.js
var ZodIssueCode, quotelessJson, ZodError;
var init_ZodError = __esm({
  "../node_modules/zod/v3/ZodError.js"() {
    init_util();
    ZodIssueCode = util.arrayToEnum([
      "invalid_type",
      "invalid_literal",
      "custom",
      "invalid_union",
      "invalid_union_discriminator",
      "invalid_enum_value",
      "unrecognized_keys",
      "invalid_arguments",
      "invalid_return_type",
      "invalid_date",
      "invalid_string",
      "too_small",
      "too_big",
      "invalid_intersection_types",
      "not_multiple_of",
      "not_finite"
    ]);
    quotelessJson = (obj) => {
      const json = JSON.stringify(obj, null, 2);
      return json.replace(/"([^"]+)":/g, "$1:");
    };
    ZodError = class _ZodError extends Error {
      get errors() {
        return this.issues;
      }
      constructor(issues) {
        super();
        this.issues = [];
        this.addIssue = (sub) => {
          this.issues = [...this.issues, sub];
        };
        this.addIssues = (subs = []) => {
          this.issues = [...this.issues, ...subs];
        };
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(this, actualProto);
        } else {
          this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
      }
      format(_mapper) {
        const mapper = _mapper || function(issue) {
          return issue.message;
        };
        const fieldErrors = { _errors: [] };
        const processError = (error) => {
          for (const issue of error.issues) {
            if (issue.code === "invalid_union") {
              issue.unionErrors.map(processError);
            } else if (issue.code === "invalid_return_type") {
              processError(issue.returnTypeError);
            } else if (issue.code === "invalid_arguments") {
              processError(issue.argumentsError);
            } else if (issue.path.length === 0) {
              fieldErrors._errors.push(mapper(issue));
            } else {
              let curr = fieldErrors;
              let i = 0;
              while (i < issue.path.length) {
                const el = issue.path[i];
                const terminal = i === issue.path.length - 1;
                if (!terminal) {
                  curr[el] = curr[el] || { _errors: [] };
                } else {
                  curr[el] = curr[el] || { _errors: [] };
                  curr[el]._errors.push(mapper(issue));
                }
                curr = curr[el];
                i++;
              }
            }
          }
        };
        processError(this);
        return fieldErrors;
      }
      static assert(value) {
        if (!(value instanceof _ZodError)) {
          throw new Error(`Not a ZodError: ${value}`);
        }
      }
      toString() {
        return this.message;
      }
      get message() {
        return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
      }
      get isEmpty() {
        return this.issues.length === 0;
      }
      flatten(mapper = (issue) => issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of this.issues) {
          if (sub.path.length > 0) {
            const firstEl = sub.path[0];
            fieldErrors[firstEl] = fieldErrors[firstEl] || [];
            fieldErrors[firstEl].push(mapper(sub));
          } else {
            formErrors.push(mapper(sub));
          }
        }
        return { formErrors, fieldErrors };
      }
      get formErrors() {
        return this.flatten();
      }
    };
    ZodError.create = (issues) => {
      const error = new ZodError(issues);
      return error;
    };
  }
});

// ../node_modules/zod/v3/locales/en.js
var errorMap, en_default;
var init_en = __esm({
  "../node_modules/zod/v3/locales/en.js"() {
    init_ZodError();
    init_util();
    errorMap = (issue, _ctx) => {
      let message;
      switch (issue.code) {
        case ZodIssueCode.invalid_type:
          if (issue.received === ZodParsedType.undefined) {
            message = "Required";
          } else {
            message = `Expected ${issue.expected}, received ${issue.received}`;
          }
          break;
        case ZodIssueCode.invalid_literal:
          message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
          break;
        case ZodIssueCode.unrecognized_keys:
          message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
          break;
        case ZodIssueCode.invalid_union:
          message = `Invalid input`;
          break;
        case ZodIssueCode.invalid_union_discriminator:
          message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
          break;
        case ZodIssueCode.invalid_enum_value:
          message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
          break;
        case ZodIssueCode.invalid_arguments:
          message = `Invalid function arguments`;
          break;
        case ZodIssueCode.invalid_return_type:
          message = `Invalid function return type`;
          break;
        case ZodIssueCode.invalid_date:
          message = `Invalid date`;
          break;
        case ZodIssueCode.invalid_string:
          if (typeof issue.validation === "object") {
            if ("includes" in issue.validation) {
              message = `Invalid input: must include "${issue.validation.includes}"`;
              if (typeof issue.validation.position === "number") {
                message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
              }
            } else if ("startsWith" in issue.validation) {
              message = `Invalid input: must start with "${issue.validation.startsWith}"`;
            } else if ("endsWith" in issue.validation) {
              message = `Invalid input: must end with "${issue.validation.endsWith}"`;
            } else {
              util.assertNever(issue.validation);
            }
          } else if (issue.validation !== "regex") {
            message = `Invalid ${issue.validation}`;
          } else {
            message = "Invalid";
          }
          break;
        case ZodIssueCode.too_small:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "bigint")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
          else
            message = "Invalid input";
          break;
        case ZodIssueCode.too_big:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "bigint")
            message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
          else
            message = "Invalid input";
          break;
        case ZodIssueCode.custom:
          message = `Invalid input`;
          break;
        case ZodIssueCode.invalid_intersection_types:
          message = `Intersection results could not be merged`;
          break;
        case ZodIssueCode.not_multiple_of:
          message = `Number must be a multiple of ${issue.multipleOf}`;
          break;
        case ZodIssueCode.not_finite:
          message = "Number must be finite";
          break;
        default:
          message = _ctx.defaultError;
          util.assertNever(issue);
      }
      return { message };
    };
    en_default = errorMap;
  }
});

// ../node_modules/zod/v3/errors.js
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}
var overrideErrorMap;
var init_errors = __esm({
  "../node_modules/zod/v3/errors.js"() {
    init_en();
    overrideErrorMap = en_default;
  }
});

// ../node_modules/zod/v3/helpers/parseUtil.js
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var makeIssue, EMPTY_PATH, ParseStatus, INVALID, DIRTY, OK, isAborted, isDirty, isValid, isAsync;
var init_parseUtil = __esm({
  "../node_modules/zod/v3/helpers/parseUtil.js"() {
    init_errors();
    init_en();
    makeIssue = (params) => {
      const { data, path: path2, errorMaps, issueData } = params;
      const fullPath = [...path2, ...issueData.path || []];
      const fullIssue = {
        ...issueData,
        path: fullPath
      };
      if (issueData.message !== void 0) {
        return {
          ...issueData,
          path: fullPath,
          message: issueData.message
        };
      }
      let errorMessage = "";
      const maps = errorMaps.filter((m) => !!m).slice().reverse();
      for (const map of maps) {
        errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
      }
      return {
        ...issueData,
        path: fullPath,
        message: errorMessage
      };
    };
    EMPTY_PATH = [];
    ParseStatus = class _ParseStatus {
      constructor() {
        this.value = "valid";
      }
      dirty() {
        if (this.value === "valid")
          this.value = "dirty";
      }
      abort() {
        if (this.value !== "aborted")
          this.value = "aborted";
      }
      static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results) {
          if (s.status === "aborted")
            return INVALID;
          if (s.status === "dirty")
            status.dirty();
          arrayValue.push(s.value);
        }
        return { status: status.value, value: arrayValue };
      }
      static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value
          });
        }
        return _ParseStatus.mergeObjectSync(status, syncPairs);
      }
      static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair of pairs) {
          const { key, value } = pair;
          if (key.status === "aborted")
            return INVALID;
          if (value.status === "aborted")
            return INVALID;
          if (key.status === "dirty")
            status.dirty();
          if (value.status === "dirty")
            status.dirty();
          if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
            finalObject[key.value] = value.value;
          }
        }
        return { status: status.value, value: finalObject };
      }
    };
    INVALID = Object.freeze({
      status: "aborted"
    });
    DIRTY = (value) => ({ status: "dirty", value });
    OK = (value) => ({ status: "valid", value });
    isAborted = (x) => x.status === "aborted";
    isDirty = (x) => x.status === "dirty";
    isValid = (x) => x.status === "valid";
    isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
  }
});

// ../node_modules/zod/v3/helpers/typeAliases.js
var init_typeAliases = __esm({
  "../node_modules/zod/v3/helpers/typeAliases.js"() {
  }
});

// ../node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
var init_errorUtil = __esm({
  "../node_modules/zod/v3/helpers/errorUtil.js"() {
    (function(errorUtil2) {
      errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
      errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
    })(errorUtil || (errorUtil = {}));
  }
});

// ../node_modules/zod/v3/types.js
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index2 = 0; index2 < a.length; index2++) {
      const itemA = a[index2];
      const itemB = b[index2];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var ParseInputLazyPath, handleResult, ZodType, cuidRegex, cuid2Regex, ulidRegex, uuidRegex, nanoidRegex, jwtRegex, durationRegex, emailRegex, _emojiRegex, emojiRegex, ipv4Regex, ipv4CidrRegex, ipv6Regex, ipv6CidrRegex, base64Regex, base64urlRegex, dateRegexSource, dateRegex, ZodString, ZodNumber, ZodBigInt, ZodBoolean, ZodDate, ZodSymbol, ZodUndefined, ZodNull, ZodAny, ZodUnknown, ZodNever, ZodVoid, ZodArray, ZodObject, ZodUnion, getDiscriminator, ZodDiscriminatedUnion, ZodIntersection, ZodTuple, ZodRecord, ZodMap, ZodSet, ZodFunction, ZodLazy, ZodLiteral, ZodEnum, ZodNativeEnum, ZodPromise, ZodEffects, ZodOptional, ZodNullable, ZodDefault, ZodCatch, ZodNaN, BRAND, ZodBranded, ZodPipeline, ZodReadonly, late, ZodFirstPartyTypeKind, instanceOfType, stringType, numberType, nanType, bigIntType, booleanType, dateType, symbolType, undefinedType, nullType, anyType, unknownType, neverType, voidType, arrayType, objectType, strictObjectType, unionType, discriminatedUnionType, intersectionType, tupleType, recordType, mapType, setType, functionType, lazyType, literalType, enumType, nativeEnumType, promiseType, effectsType, optionalType, nullableType, preprocessType, pipelineType, ostring, onumber, oboolean, coerce, NEVER;
var init_types = __esm({
  "../node_modules/zod/v3/types.js"() {
    init_ZodError();
    init_errors();
    init_errorUtil();
    init_parseUtil();
    init_util();
    ParseInputLazyPath = class {
      constructor(parent, value, path2, key) {
        this._cachedPath = [];
        this.parent = parent;
        this.data = value;
        this._path = path2;
        this._key = key;
      }
      get path() {
        if (!this._cachedPath.length) {
          if (Array.isArray(this._key)) {
            this._cachedPath.push(...this._path, ...this._key);
          } else {
            this._cachedPath.push(...this._path, this._key);
          }
        }
        return this._cachedPath;
      }
    };
    handleResult = (ctx, result) => {
      if (isValid(result)) {
        return { success: true, data: result.value };
      } else {
        if (!ctx.common.issues.length) {
          throw new Error("Validation failed but no issues detected.");
        }
        return {
          success: false,
          get error() {
            if (this._error)
              return this._error;
            const error = new ZodError(ctx.common.issues);
            this._error = error;
            return this._error;
          }
        };
      }
    };
    ZodType = class {
      get description() {
        return this._def.description;
      }
      _getType(input) {
        return getParsedType(input.data);
      }
      _getOrReturnCtx(input, ctx) {
        return ctx || {
          common: input.parent.common,
          data: input.data,
          parsedType: getParsedType(input.data),
          schemaErrorMap: this._def.errorMap,
          path: input.path,
          parent: input.parent
        };
      }
      _processInputParams(input) {
        return {
          status: new ParseStatus(),
          ctx: {
            common: input.parent.common,
            data: input.data,
            parsedType: getParsedType(input.data),
            schemaErrorMap: this._def.errorMap,
            path: input.path,
            parent: input.parent
          }
        };
      }
      _parseSync(input) {
        const result = this._parse(input);
        if (isAsync(result)) {
          throw new Error("Synchronous parse encountered promise.");
        }
        return result;
      }
      _parseAsync(input) {
        const result = this._parse(input);
        return Promise.resolve(result);
      }
      parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      safeParse(data, params) {
        const ctx = {
          common: {
            issues: [],
            async: params?.async ?? false,
            contextualErrorMap: params?.errorMap
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        const result = this._parseSync({ data, path: ctx.path, parent: ctx });
        return handleResult(ctx, result);
      }
      "~validate"(data) {
        const ctx = {
          common: {
            issues: [],
            async: !!this["~standard"].async
          },
          path: [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        if (!this["~standard"].async) {
          try {
            const result = this._parseSync({ data, path: [], parent: ctx });
            return isValid(result) ? {
              value: result.value
            } : {
              issues: ctx.common.issues
            };
          } catch (err) {
            if (err?.message?.toLowerCase()?.includes("encountered")) {
              this["~standard"].async = true;
            }
            ctx.common = {
              issues: [],
              async: true
            };
          }
        }
        return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        });
      }
      async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      async safeParseAsync(data, params) {
        const ctx = {
          common: {
            issues: [],
            contextualErrorMap: params?.errorMap,
            async: true
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
        const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
      }
      refine(check, message) {
        const getIssueProperties = (val) => {
          if (typeof message === "string" || typeof message === "undefined") {
            return { message };
          } else if (typeof message === "function") {
            return message(val);
          } else {
            return message;
          }
        };
        return this._refinement((val, ctx) => {
          const result = check(val);
          const setError = () => ctx.addIssue({
            code: ZodIssueCode.custom,
            ...getIssueProperties(val)
          });
          if (typeof Promise !== "undefined" && result instanceof Promise) {
            return result.then((data) => {
              if (!data) {
                setError();
                return false;
              } else {
                return true;
              }
            });
          }
          if (!result) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      refinement(check, refinementData) {
        return this._refinement((val, ctx) => {
          if (!check(val)) {
            ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
            return false;
          } else {
            return true;
          }
        });
      }
      _refinement(refinement) {
        return new ZodEffects({
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "refinement", refinement }
        });
      }
      superRefine(refinement) {
        return this._refinement(refinement);
      }
      constructor(def) {
        this.spa = this.safeParseAsync;
        this._def = def;
        this.parse = this.parse.bind(this);
        this.safeParse = this.safeParse.bind(this);
        this.parseAsync = this.parseAsync.bind(this);
        this.safeParseAsync = this.safeParseAsync.bind(this);
        this.spa = this.spa.bind(this);
        this.refine = this.refine.bind(this);
        this.refinement = this.refinement.bind(this);
        this.superRefine = this.superRefine.bind(this);
        this.optional = this.optional.bind(this);
        this.nullable = this.nullable.bind(this);
        this.nullish = this.nullish.bind(this);
        this.array = this.array.bind(this);
        this.promise = this.promise.bind(this);
        this.or = this.or.bind(this);
        this.and = this.and.bind(this);
        this.transform = this.transform.bind(this);
        this.brand = this.brand.bind(this);
        this.default = this.default.bind(this);
        this.catch = this.catch.bind(this);
        this.describe = this.describe.bind(this);
        this.pipe = this.pipe.bind(this);
        this.readonly = this.readonly.bind(this);
        this.isNullable = this.isNullable.bind(this);
        this.isOptional = this.isOptional.bind(this);
        this["~standard"] = {
          version: 1,
          vendor: "zod",
          validate: (data) => this["~validate"](data)
        };
      }
      optional() {
        return ZodOptional.create(this, this._def);
      }
      nullable() {
        return ZodNullable.create(this, this._def);
      }
      nullish() {
        return this.nullable().optional();
      }
      array() {
        return ZodArray.create(this);
      }
      promise() {
        return ZodPromise.create(this, this._def);
      }
      or(option) {
        return ZodUnion.create([this, option], this._def);
      }
      and(incoming) {
        return ZodIntersection.create(this, incoming, this._def);
      }
      transform(transform) {
        return new ZodEffects({
          ...processCreateParams(this._def),
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "transform", transform }
        });
      }
      default(def) {
        const defaultValueFunc = typeof def === "function" ? def : () => def;
        return new ZodDefault({
          ...processCreateParams(this._def),
          innerType: this,
          defaultValue: defaultValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodDefault
        });
      }
      brand() {
        return new ZodBranded({
          typeName: ZodFirstPartyTypeKind.ZodBranded,
          type: this,
          ...processCreateParams(this._def)
        });
      }
      catch(def) {
        const catchValueFunc = typeof def === "function" ? def : () => def;
        return new ZodCatch({
          ...processCreateParams(this._def),
          innerType: this,
          catchValue: catchValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodCatch
        });
      }
      describe(description) {
        const This = this.constructor;
        return new This({
          ...this._def,
          description
        });
      }
      pipe(target) {
        return ZodPipeline.create(this, target);
      }
      readonly() {
        return ZodReadonly.create(this);
      }
      isOptional() {
        return this.safeParse(void 0).success;
      }
      isNullable() {
        return this.safeParse(null).success;
      }
    };
    cuidRegex = /^c[^\s-]{8,}$/i;
    cuid2Regex = /^[0-9a-z]+$/;
    ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
    uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    nanoidRegex = /^[a-z0-9_-]{21}$/i;
    jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
    emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
    _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
    ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
    ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
    ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
    base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
    dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
    dateRegex = new RegExp(`^${dateRegexSource}$`);
    ZodString = class _ZodString extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = String(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.string) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.string,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        const status = new ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.length < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.length > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "length") {
            const tooBig = input.data.length > check.value;
            const tooSmall = input.data.length < check.value;
            if (tooBig || tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              if (tooBig) {
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_big,
                  maximum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              } else if (tooSmall) {
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_small,
                  minimum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              }
              status.dirty();
            }
          } else if (check.kind === "email") {
            if (!emailRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "email",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "emoji") {
            if (!emojiRegex) {
              emojiRegex = new RegExp(_emojiRegex, "u");
            }
            if (!emojiRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "emoji",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "uuid") {
            if (!uuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "uuid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "nanoid") {
            if (!nanoidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "nanoid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid") {
            if (!cuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cuid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid2") {
            if (!cuid2Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cuid2",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ulid") {
            if (!ulidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "ulid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "url") {
            try {
              new URL(input.data);
            } catch {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "url",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "regex") {
            check.regex.lastIndex = 0;
            const testResult = check.regex.test(input.data);
            if (!testResult) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "regex",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "trim") {
            input.data = input.data.trim();
          } else if (check.kind === "includes") {
            if (!input.data.includes(check.value, check.position)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { includes: check.value, position: check.position },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "toLowerCase") {
            input.data = input.data.toLowerCase();
          } else if (check.kind === "toUpperCase") {
            input.data = input.data.toUpperCase();
          } else if (check.kind === "startsWith") {
            if (!input.data.startsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { startsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "endsWith") {
            if (!input.data.endsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { endsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "datetime") {
            const regex = datetimeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "datetime",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "date") {
            const regex = dateRegex;
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "date",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "time") {
            const regex = timeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "time",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "duration") {
            if (!durationRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "duration",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ip") {
            if (!isValidIP(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "ip",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "jwt") {
            if (!isValidJWT(input.data, check.alg)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "jwt",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cidr") {
            if (!isValidCidr(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cidr",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64") {
            if (!base64Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "base64",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64url") {
            if (!base64urlRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "base64url",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _regex(regex, validation, message) {
        return this.refinement((data) => regex.test(data), {
          validation,
          code: ZodIssueCode.invalid_string,
          ...errorUtil.errToObj(message)
        });
      }
      _addCheck(check) {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      email(message) {
        return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
      }
      url(message) {
        return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
      }
      emoji(message) {
        return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
      }
      uuid(message) {
        return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
      }
      nanoid(message) {
        return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
      }
      cuid(message) {
        return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
      }
      cuid2(message) {
        return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
      }
      ulid(message) {
        return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
      }
      base64(message) {
        return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
      }
      base64url(message) {
        return this._addCheck({
          kind: "base64url",
          ...errorUtil.errToObj(message)
        });
      }
      jwt(options) {
        return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
      }
      ip(options) {
        return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
      }
      cidr(options) {
        return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
      }
      datetime(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "datetime",
            precision: null,
            offset: false,
            local: false,
            message: options
          });
        }
        return this._addCheck({
          kind: "datetime",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          offset: options?.offset ?? false,
          local: options?.local ?? false,
          ...errorUtil.errToObj(options?.message)
        });
      }
      date(message) {
        return this._addCheck({ kind: "date", message });
      }
      time(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "time",
            precision: null,
            message: options
          });
        }
        return this._addCheck({
          kind: "time",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          ...errorUtil.errToObj(options?.message)
        });
      }
      duration(message) {
        return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
      }
      regex(regex, message) {
        return this._addCheck({
          kind: "regex",
          regex,
          ...errorUtil.errToObj(message)
        });
      }
      includes(value, options) {
        return this._addCheck({
          kind: "includes",
          value,
          position: options?.position,
          ...errorUtil.errToObj(options?.message)
        });
      }
      startsWith(value, message) {
        return this._addCheck({
          kind: "startsWith",
          value,
          ...errorUtil.errToObj(message)
        });
      }
      endsWith(value, message) {
        return this._addCheck({
          kind: "endsWith",
          value,
          ...errorUtil.errToObj(message)
        });
      }
      min(minLength, message) {
        return this._addCheck({
          kind: "min",
          value: minLength,
          ...errorUtil.errToObj(message)
        });
      }
      max(maxLength, message) {
        return this._addCheck({
          kind: "max",
          value: maxLength,
          ...errorUtil.errToObj(message)
        });
      }
      length(len, message) {
        return this._addCheck({
          kind: "length",
          value: len,
          ...errorUtil.errToObj(message)
        });
      }
      /**
       * Equivalent to `.min(1)`
       */
      nonempty(message) {
        return this.min(1, errorUtil.errToObj(message));
      }
      trim() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "trim" }]
        });
      }
      toLowerCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toLowerCase" }]
        });
      }
      toUpperCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toUpperCase" }]
        });
      }
      get isDatetime() {
        return !!this._def.checks.find((ch) => ch.kind === "datetime");
      }
      get isDate() {
        return !!this._def.checks.find((ch) => ch.kind === "date");
      }
      get isTime() {
        return !!this._def.checks.find((ch) => ch.kind === "time");
      }
      get isDuration() {
        return !!this._def.checks.find((ch) => ch.kind === "duration");
      }
      get isEmail() {
        return !!this._def.checks.find((ch) => ch.kind === "email");
      }
      get isURL() {
        return !!this._def.checks.find((ch) => ch.kind === "url");
      }
      get isEmoji() {
        return !!this._def.checks.find((ch) => ch.kind === "emoji");
      }
      get isUUID() {
        return !!this._def.checks.find((ch) => ch.kind === "uuid");
      }
      get isNANOID() {
        return !!this._def.checks.find((ch) => ch.kind === "nanoid");
      }
      get isCUID() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid");
      }
      get isCUID2() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid2");
      }
      get isULID() {
        return !!this._def.checks.find((ch) => ch.kind === "ulid");
      }
      get isIP() {
        return !!this._def.checks.find((ch) => ch.kind === "ip");
      }
      get isCIDR() {
        return !!this._def.checks.find((ch) => ch.kind === "cidr");
      }
      get isBase64() {
        return !!this._def.checks.find((ch) => ch.kind === "base64");
      }
      get isBase64url() {
        return !!this._def.checks.find((ch) => ch.kind === "base64url");
      }
      get minLength() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxLength() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    ZodString.create = (params) => {
      return new ZodString({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodString,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    ZodNumber = class _ZodNumber extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
        this.step = this.multipleOf;
      }
      _parse(input) {
        if (this._def.coerce) {
          input.data = Number(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.number) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.number,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        let ctx = void 0;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "int") {
            if (!util.isInteger(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: "integer",
                received: "float",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (floatSafeRemainder(input.data, check.value) !== 0) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "finite") {
            if (!Number.isFinite(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_finite,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodNumber({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodNumber({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      int(message) {
        return this._addCheck({
          kind: "int",
          message: errorUtil.toString(message)
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil.toString(message)
        });
      }
      finite(message) {
        return this._addCheck({
          kind: "finite",
          message: errorUtil.toString(message)
        });
      }
      safe(message) {
        return this._addCheck({
          kind: "min",
          inclusive: true,
          value: Number.MIN_SAFE_INTEGER,
          message: errorUtil.toString(message)
        })._addCheck({
          kind: "max",
          inclusive: true,
          value: Number.MAX_SAFE_INTEGER,
          message: errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
      get isInt() {
        return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
      }
      get isFinite() {
        let max = null;
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
            return true;
          } else if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          } else if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return Number.isFinite(min) && Number.isFinite(max);
      }
    };
    ZodNumber.create = (params) => {
      return new ZodNumber({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodNumber,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    ZodBigInt = class _ZodBigInt extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
      }
      _parse(input) {
        if (this._def.coerce) {
          try {
            input.data = BigInt(input.data);
          } catch {
            return this._getInvalidInput(input);
          }
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.bigint) {
          return this._getInvalidInput(input);
        }
        let ctx = void 0;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                type: "bigint",
                minimum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                type: "bigint",
                maximum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (input.data % check.value !== BigInt(0)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _getInvalidInput(input) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.bigint,
          received: ctx.parsedType
        });
        return INVALID;
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodBigInt({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodBigInt({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    ZodBigInt.create = (params) => {
      return new ZodBigInt({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodBigInt,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    ZodBoolean = class extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = Boolean(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.boolean) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.boolean,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodBoolean.create = (params) => {
      return new ZodBoolean({
        typeName: ZodFirstPartyTypeKind.ZodBoolean,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    ZodDate = class _ZodDate extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = new Date(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.date) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.date,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        if (Number.isNaN(input.data.getTime())) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_date
          });
          return INVALID;
        }
        const status = new ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.getTime() < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                message: check.message,
                inclusive: true,
                exact: false,
                minimum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.getTime() > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                message: check.message,
                inclusive: true,
                exact: false,
                maximum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return {
          status: status.value,
          value: new Date(input.data.getTime())
        };
      }
      _addCheck(check) {
        return new _ZodDate({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      min(minDate, message) {
        return this._addCheck({
          kind: "min",
          value: minDate.getTime(),
          message: errorUtil.toString(message)
        });
      }
      max(maxDate, message) {
        return this._addCheck({
          kind: "max",
          value: maxDate.getTime(),
          message: errorUtil.toString(message)
        });
      }
      get minDate() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min != null ? new Date(min) : null;
      }
      get maxDate() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max != null ? new Date(max) : null;
      }
    };
    ZodDate.create = (params) => {
      return new ZodDate({
        checks: [],
        coerce: params?.coerce || false,
        typeName: ZodFirstPartyTypeKind.ZodDate,
        ...processCreateParams(params)
      });
    };
    ZodSymbol = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.symbol) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.symbol,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodSymbol.create = (params) => {
      return new ZodSymbol({
        typeName: ZodFirstPartyTypeKind.ZodSymbol,
        ...processCreateParams(params)
      });
    };
    ZodUndefined = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.undefined,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodUndefined.create = (params) => {
      return new ZodUndefined({
        typeName: ZodFirstPartyTypeKind.ZodUndefined,
        ...processCreateParams(params)
      });
    };
    ZodNull = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.null) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.null,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodNull.create = (params) => {
      return new ZodNull({
        typeName: ZodFirstPartyTypeKind.ZodNull,
        ...processCreateParams(params)
      });
    };
    ZodAny = class extends ZodType {
      constructor() {
        super(...arguments);
        this._any = true;
      }
      _parse(input) {
        return OK(input.data);
      }
    };
    ZodAny.create = (params) => {
      return new ZodAny({
        typeName: ZodFirstPartyTypeKind.ZodAny,
        ...processCreateParams(params)
      });
    };
    ZodUnknown = class extends ZodType {
      constructor() {
        super(...arguments);
        this._unknown = true;
      }
      _parse(input) {
        return OK(input.data);
      }
    };
    ZodUnknown.create = (params) => {
      return new ZodUnknown({
        typeName: ZodFirstPartyTypeKind.ZodUnknown,
        ...processCreateParams(params)
      });
    };
    ZodNever = class extends ZodType {
      _parse(input) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.never,
          received: ctx.parsedType
        });
        return INVALID;
      }
    };
    ZodNever.create = (params) => {
      return new ZodNever({
        typeName: ZodFirstPartyTypeKind.ZodNever,
        ...processCreateParams(params)
      });
    };
    ZodVoid = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.void,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodVoid.create = (params) => {
      return new ZodVoid({
        typeName: ZodFirstPartyTypeKind.ZodVoid,
        ...processCreateParams(params)
      });
    };
    ZodArray = class _ZodArray extends ZodType {
      _parse(input) {
        const { ctx, status } = this._processInputParams(input);
        const def = this._def;
        if (ctx.parsedType !== ZodParsedType.array) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: ctx.parsedType
          });
          return INVALID;
        }
        if (def.exactLength !== null) {
          const tooBig = ctx.data.length > def.exactLength.value;
          const tooSmall = ctx.data.length < def.exactLength.value;
          if (tooBig || tooSmall) {
            addIssueToContext(ctx, {
              code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
              minimum: tooSmall ? def.exactLength.value : void 0,
              maximum: tooBig ? def.exactLength.value : void 0,
              type: "array",
              inclusive: true,
              exact: true,
              message: def.exactLength.message
            });
            status.dirty();
          }
        }
        if (def.minLength !== null) {
          if (ctx.data.length < def.minLength.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: def.minLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.minLength.message
            });
            status.dirty();
          }
        }
        if (def.maxLength !== null) {
          if (ctx.data.length > def.maxLength.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: def.maxLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.maxLength.message
            });
            status.dirty();
          }
        }
        if (ctx.common.async) {
          return Promise.all([...ctx.data].map((item, i) => {
            return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
          })).then((result2) => {
            return ParseStatus.mergeArray(status, result2);
          });
        }
        const result = [...ctx.data].map((item, i) => {
          return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        });
        return ParseStatus.mergeArray(status, result);
      }
      get element() {
        return this._def.type;
      }
      min(minLength, message) {
        return new _ZodArray({
          ...this._def,
          minLength: { value: minLength, message: errorUtil.toString(message) }
        });
      }
      max(maxLength, message) {
        return new _ZodArray({
          ...this._def,
          maxLength: { value: maxLength, message: errorUtil.toString(message) }
        });
      }
      length(len, message) {
        return new _ZodArray({
          ...this._def,
          exactLength: { value: len, message: errorUtil.toString(message) }
        });
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    ZodArray.create = (schema, params) => {
      return new ZodArray({
        type: schema,
        minLength: null,
        maxLength: null,
        exactLength: null,
        typeName: ZodFirstPartyTypeKind.ZodArray,
        ...processCreateParams(params)
      });
    };
    ZodObject = class _ZodObject extends ZodType {
      constructor() {
        super(...arguments);
        this._cached = null;
        this.nonstrict = this.passthrough;
        this.augment = this.extend;
      }
      _getCached() {
        if (this._cached !== null)
          return this._cached;
        const shape = this._def.shape();
        const keys = util.objectKeys(shape);
        this._cached = { shape, keys };
        return this._cached;
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.object) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        const { status, ctx } = this._processInputParams(input);
        const { shape, keys: shapeKeys } = this._getCached();
        const extraKeys = [];
        if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
          for (const key in ctx.data) {
            if (!shapeKeys.includes(key)) {
              extraKeys.push(key);
            }
          }
        }
        const pairs = [];
        for (const key of shapeKeys) {
          const keyValidator = shape[key];
          const value = ctx.data[key];
          pairs.push({
            key: { status: "valid", value: key },
            value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (this._def.catchall instanceof ZodNever) {
          const unknownKeys = this._def.unknownKeys;
          if (unknownKeys === "passthrough") {
            for (const key of extraKeys) {
              pairs.push({
                key: { status: "valid", value: key },
                value: { status: "valid", value: ctx.data[key] }
              });
            }
          } else if (unknownKeys === "strict") {
            if (extraKeys.length > 0) {
              addIssueToContext(ctx, {
                code: ZodIssueCode.unrecognized_keys,
                keys: extraKeys
              });
              status.dirty();
            }
          } else if (unknownKeys === "strip") {
          } else {
            throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
          }
        } else {
          const catchall = this._def.catchall;
          for (const key of extraKeys) {
            const value = ctx.data[key];
            pairs.push({
              key: { status: "valid", value: key },
              value: catchall._parse(
                new ParseInputLazyPath(ctx, value, ctx.path, key)
                //, ctx.child(key), value, getParsedType(value)
              ),
              alwaysSet: key in ctx.data
            });
          }
        }
        if (ctx.common.async) {
          return Promise.resolve().then(async () => {
            const syncPairs = [];
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              syncPairs.push({
                key,
                value,
                alwaysSet: pair.alwaysSet
              });
            }
            return syncPairs;
          }).then((syncPairs) => {
            return ParseStatus.mergeObjectSync(status, syncPairs);
          });
        } else {
          return ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get shape() {
        return this._def.shape();
      }
      strict(message) {
        errorUtil.errToObj;
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strict",
          ...message !== void 0 ? {
            errorMap: (issue, ctx) => {
              const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
              if (issue.code === "unrecognized_keys")
                return {
                  message: errorUtil.errToObj(message).message ?? defaultError
                };
              return {
                message: defaultError
              };
            }
          } : {}
        });
      }
      strip() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strip"
        });
      }
      passthrough() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "passthrough"
        });
      }
      // const AugmentFactory =
      //   <Def extends ZodObjectDef>(def: Def) =>
      //   <Augmentation extends ZodRawShape>(
      //     augmentation: Augmentation
      //   ): ZodObject<
      //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
      //     Def["unknownKeys"],
      //     Def["catchall"]
      //   > => {
      //     return new ZodObject({
      //       ...def,
      //       shape: () => ({
      //         ...def.shape(),
      //         ...augmentation,
      //       }),
      //     }) as any;
      //   };
      extend(augmentation) {
        return new _ZodObject({
          ...this._def,
          shape: () => ({
            ...this._def.shape(),
            ...augmentation
          })
        });
      }
      /**
       * Prior to zod@1.0.12 there was a bug in the
       * inferred type of merged objects. Please
       * upgrade if you are experiencing issues.
       */
      merge(merging) {
        const merged = new _ZodObject({
          unknownKeys: merging._def.unknownKeys,
          catchall: merging._def.catchall,
          shape: () => ({
            ...this._def.shape(),
            ...merging._def.shape()
          }),
          typeName: ZodFirstPartyTypeKind.ZodObject
        });
        return merged;
      }
      // merge<
      //   Incoming extends AnyZodObject,
      //   Augmentation extends Incoming["shape"],
      //   NewOutput extends {
      //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
      //       ? Augmentation[k]["_output"]
      //       : k extends keyof Output
      //       ? Output[k]
      //       : never;
      //   },
      //   NewInput extends {
      //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
      //       ? Augmentation[k]["_input"]
      //       : k extends keyof Input
      //       ? Input[k]
      //       : never;
      //   }
      // >(
      //   merging: Incoming
      // ): ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"],
      //   NewOutput,
      //   NewInput
      // > {
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      setKey(key, schema) {
        return this.augment({ [key]: schema });
      }
      // merge<Incoming extends AnyZodObject>(
      //   merging: Incoming
      // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
      // ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"]
      // > {
      //   // const mergedShape = objectUtil.mergeShapes(
      //   //   this._def.shape(),
      //   //   merging._def.shape()
      //   // );
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      catchall(index2) {
        return new _ZodObject({
          ...this._def,
          catchall: index2
        });
      }
      pick(mask) {
        const shape = {};
        for (const key of util.objectKeys(mask)) {
          if (mask[key] && this.shape[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => shape
        });
      }
      omit(mask) {
        const shape = {};
        for (const key of util.objectKeys(this.shape)) {
          if (!mask[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => shape
        });
      }
      /**
       * @deprecated
       */
      deepPartial() {
        return deepPartialify(this);
      }
      partial(mask) {
        const newShape = {};
        for (const key of util.objectKeys(this.shape)) {
          const fieldSchema = this.shape[key];
          if (mask && !mask[key]) {
            newShape[key] = fieldSchema;
          } else {
            newShape[key] = fieldSchema.optional();
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => newShape
        });
      }
      required(mask) {
        const newShape = {};
        for (const key of util.objectKeys(this.shape)) {
          if (mask && !mask[key]) {
            newShape[key] = this.shape[key];
          } else {
            const fieldSchema = this.shape[key];
            let newField = fieldSchema;
            while (newField instanceof ZodOptional) {
              newField = newField._def.innerType;
            }
            newShape[key] = newField;
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => newShape
        });
      }
      keyof() {
        return createZodEnum(util.objectKeys(this.shape));
      }
    };
    ZodObject.create = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.strictCreate = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strict",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.lazycreate = (shape, params) => {
      return new ZodObject({
        shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodUnion = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const options = this._def.options;
        function handleResults(results) {
          for (const result of results) {
            if (result.result.status === "valid") {
              return result.result;
            }
          }
          for (const result of results) {
            if (result.result.status === "dirty") {
              ctx.common.issues.push(...result.ctx.common.issues);
              return result.result;
            }
          }
          const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union,
            unionErrors
          });
          return INVALID;
        }
        if (ctx.common.async) {
          return Promise.all(options.map(async (option) => {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            return {
              result: await option._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: childCtx
              }),
              ctx: childCtx
            };
          })).then(handleResults);
        } else {
          let dirty = void 0;
          const issues = [];
          for (const option of options) {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            const result = option._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: childCtx
            });
            if (result.status === "valid") {
              return result;
            } else if (result.status === "dirty" && !dirty) {
              dirty = { result, ctx: childCtx };
            }
            if (childCtx.common.issues.length) {
              issues.push(childCtx.common.issues);
            }
          }
          if (dirty) {
            ctx.common.issues.push(...dirty.ctx.common.issues);
            return dirty.result;
          }
          const unionErrors = issues.map((issues2) => new ZodError(issues2));
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union,
            unionErrors
          });
          return INVALID;
        }
      }
      get options() {
        return this._def.options;
      }
    };
    ZodUnion.create = (types, params) => {
      return new ZodUnion({
        options: types,
        typeName: ZodFirstPartyTypeKind.ZodUnion,
        ...processCreateParams(params)
      });
    };
    getDiscriminator = (type) => {
      if (type instanceof ZodLazy) {
        return getDiscriminator(type.schema);
      } else if (type instanceof ZodEffects) {
        return getDiscriminator(type.innerType());
      } else if (type instanceof ZodLiteral) {
        return [type.value];
      } else if (type instanceof ZodEnum) {
        return type.options;
      } else if (type instanceof ZodNativeEnum) {
        return util.objectValues(type.enum);
      } else if (type instanceof ZodDefault) {
        return getDiscriminator(type._def.innerType);
      } else if (type instanceof ZodUndefined) {
        return [void 0];
      } else if (type instanceof ZodNull) {
        return [null];
      } else if (type instanceof ZodOptional) {
        return [void 0, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodNullable) {
        return [null, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodBranded) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodReadonly) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodCatch) {
        return getDiscriminator(type._def.innerType);
      } else {
        return [];
      }
    };
    ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const discriminator = this.discriminator;
        const discriminatorValue = ctx.data[discriminator];
        const option = this.optionsMap.get(discriminatorValue);
        if (!option) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union_discriminator,
            options: Array.from(this.optionsMap.keys()),
            path: [discriminator]
          });
          return INVALID;
        }
        if (ctx.common.async) {
          return option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        } else {
          return option._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        }
      }
      get discriminator() {
        return this._def.discriminator;
      }
      get options() {
        return this._def.options;
      }
      get optionsMap() {
        return this._def.optionsMap;
      }
      /**
       * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
       * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
       * have a different value for each object in the union.
       * @param discriminator the name of the discriminator property
       * @param types an array of object schemas
       * @param params
       */
      static create(discriminator, options, params) {
        const optionsMap = /* @__PURE__ */ new Map();
        for (const type of options) {
          const discriminatorValues = getDiscriminator(type.shape[discriminator]);
          if (!discriminatorValues.length) {
            throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
          }
          for (const value of discriminatorValues) {
            if (optionsMap.has(value)) {
              throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
            }
            optionsMap.set(value, type);
          }
        }
        return new _ZodDiscriminatedUnion({
          typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
          discriminator,
          options,
          optionsMap,
          ...processCreateParams(params)
        });
      }
    };
    ZodIntersection = class extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const handleParsed = (parsedLeft, parsedRight) => {
          if (isAborted(parsedLeft) || isAborted(parsedRight)) {
            return INVALID;
          }
          const merged = mergeValues(parsedLeft.value, parsedRight.value);
          if (!merged.valid) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_intersection_types
            });
            return INVALID;
          }
          if (isDirty(parsedLeft) || isDirty(parsedRight)) {
            status.dirty();
          }
          return { status: status.value, value: merged.data };
        };
        if (ctx.common.async) {
          return Promise.all([
            this._def.left._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            }),
            this._def.right._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            })
          ]).then(([left, right]) => handleParsed(left, right));
        } else {
          return handleParsed(this._def.left._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }), this._def.right._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }));
        }
      }
    };
    ZodIntersection.create = (left, right, params) => {
      return new ZodIntersection({
        left,
        right,
        typeName: ZodFirstPartyTypeKind.ZodIntersection,
        ...processCreateParams(params)
      });
    };
    ZodTuple = class _ZodTuple extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.array) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: ctx.parsedType
          });
          return INVALID;
        }
        if (ctx.data.length < this._def.items.length) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          return INVALID;
        }
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          status.dirty();
        }
        const items = [...ctx.data].map((item, itemIndex) => {
          const schema = this._def.items[itemIndex] || this._def.rest;
          if (!schema)
            return null;
          return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
        }).filter((x) => !!x);
        if (ctx.common.async) {
          return Promise.all(items).then((results) => {
            return ParseStatus.mergeArray(status, results);
          });
        } else {
          return ParseStatus.mergeArray(status, items);
        }
      }
      get items() {
        return this._def.items;
      }
      rest(rest) {
        return new _ZodTuple({
          ...this._def,
          rest
        });
      }
    };
    ZodTuple.create = (schemas, params) => {
      if (!Array.isArray(schemas)) {
        throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
      }
      return new ZodTuple({
        items: schemas,
        typeName: ZodFirstPartyTypeKind.ZodTuple,
        rest: null,
        ...processCreateParams(params)
      });
    };
    ZodRecord = class _ZodRecord extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const pairs = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        for (const key in ctx.data) {
          pairs.push({
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
            value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (ctx.common.async) {
          return ParseStatus.mergeObjectAsync(status, pairs);
        } else {
          return ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get element() {
        return this._def.valueType;
      }
      static create(first, second, third) {
        if (second instanceof ZodType) {
          return new _ZodRecord({
            keyType: first,
            valueType: second,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(third)
          });
        }
        return new _ZodRecord({
          keyType: ZodString.create(),
          valueType: first,
          typeName: ZodFirstPartyTypeKind.ZodRecord,
          ...processCreateParams(second)
        });
      }
    };
    ZodMap = class extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.map) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.map,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const pairs = [...ctx.data.entries()].map(([key, value], index2) => {
          return {
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index2, "key"])),
            value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index2, "value"]))
          };
        });
        if (ctx.common.async) {
          const finalMap = /* @__PURE__ */ new Map();
          return Promise.resolve().then(async () => {
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              if (key.status === "aborted" || value.status === "aborted") {
                return INVALID;
              }
              if (key.status === "dirty" || value.status === "dirty") {
                status.dirty();
              }
              finalMap.set(key.value, value.value);
            }
            return { status: status.value, value: finalMap };
          });
        } else {
          const finalMap = /* @__PURE__ */ new Map();
          for (const pair of pairs) {
            const key = pair.key;
            const value = pair.value;
            if (key.status === "aborted" || value.status === "aborted") {
              return INVALID;
            }
            if (key.status === "dirty" || value.status === "dirty") {
              status.dirty();
            }
            finalMap.set(key.value, value.value);
          }
          return { status: status.value, value: finalMap };
        }
      }
    };
    ZodMap.create = (keyType, valueType, params) => {
      return new ZodMap({
        valueType,
        keyType,
        typeName: ZodFirstPartyTypeKind.ZodMap,
        ...processCreateParams(params)
      });
    };
    ZodSet = class _ZodSet extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.set) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.set,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const def = this._def;
        if (def.minSize !== null) {
          if (ctx.data.size < def.minSize.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: def.minSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.minSize.message
            });
            status.dirty();
          }
        }
        if (def.maxSize !== null) {
          if (ctx.data.size > def.maxSize.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: def.maxSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.maxSize.message
            });
            status.dirty();
          }
        }
        const valueType = this._def.valueType;
        function finalizeSet(elements2) {
          const parsedSet = /* @__PURE__ */ new Set();
          for (const element of elements2) {
            if (element.status === "aborted")
              return INVALID;
            if (element.status === "dirty")
              status.dirty();
            parsedSet.add(element.value);
          }
          return { status: status.value, value: parsedSet };
        }
        const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
        if (ctx.common.async) {
          return Promise.all(elements).then((elements2) => finalizeSet(elements2));
        } else {
          return finalizeSet(elements);
        }
      }
      min(minSize, message) {
        return new _ZodSet({
          ...this._def,
          minSize: { value: minSize, message: errorUtil.toString(message) }
        });
      }
      max(maxSize, message) {
        return new _ZodSet({
          ...this._def,
          maxSize: { value: maxSize, message: errorUtil.toString(message) }
        });
      }
      size(size, message) {
        return this.min(size, message).max(size, message);
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    ZodSet.create = (valueType, params) => {
      return new ZodSet({
        valueType,
        minSize: null,
        maxSize: null,
        typeName: ZodFirstPartyTypeKind.ZodSet,
        ...processCreateParams(params)
      });
    };
    ZodFunction = class _ZodFunction extends ZodType {
      constructor() {
        super(...arguments);
        this.validate = this.implement;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.function) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.function,
            received: ctx.parsedType
          });
          return INVALID;
        }
        function makeArgsIssue(args, error) {
          return makeIssue({
            data: args,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
            issueData: {
              code: ZodIssueCode.invalid_arguments,
              argumentsError: error
            }
          });
        }
        function makeReturnsIssue(returns, error) {
          return makeIssue({
            data: returns,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
            issueData: {
              code: ZodIssueCode.invalid_return_type,
              returnTypeError: error
            }
          });
        }
        const params = { errorMap: ctx.common.contextualErrorMap };
        const fn = ctx.data;
        if (this._def.returns instanceof ZodPromise) {
          const me = this;
          return OK(async function(...args) {
            const error = new ZodError([]);
            const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
              error.addIssue(makeArgsIssue(args, e));
              throw error;
            });
            const result = await Reflect.apply(fn, this, parsedArgs);
            const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
              error.addIssue(makeReturnsIssue(result, e));
              throw error;
            });
            return parsedReturns;
          });
        } else {
          const me = this;
          return OK(function(...args) {
            const parsedArgs = me._def.args.safeParse(args, params);
            if (!parsedArgs.success) {
              throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
            }
            const result = Reflect.apply(fn, this, parsedArgs.data);
            const parsedReturns = me._def.returns.safeParse(result, params);
            if (!parsedReturns.success) {
              throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
            }
            return parsedReturns.data;
          });
        }
      }
      parameters() {
        return this._def.args;
      }
      returnType() {
        return this._def.returns;
      }
      args(...items) {
        return new _ZodFunction({
          ...this._def,
          args: ZodTuple.create(items).rest(ZodUnknown.create())
        });
      }
      returns(returnType) {
        return new _ZodFunction({
          ...this._def,
          returns: returnType
        });
      }
      implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      static create(args, returns, params) {
        return new _ZodFunction({
          args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
          returns: returns || ZodUnknown.create(),
          typeName: ZodFirstPartyTypeKind.ZodFunction,
          ...processCreateParams(params)
        });
      }
    };
    ZodLazy = class extends ZodType {
      get schema() {
        return this._def.getter();
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const lazySchema = this._def.getter();
        return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
      }
    };
    ZodLazy.create = (getter, params) => {
      return new ZodLazy({
        getter,
        typeName: ZodFirstPartyTypeKind.ZodLazy,
        ...processCreateParams(params)
      });
    };
    ZodLiteral = class extends ZodType {
      _parse(input) {
        if (input.data !== this._def.value) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_literal,
            expected: this._def.value
          });
          return INVALID;
        }
        return { status: "valid", value: input.data };
      }
      get value() {
        return this._def.value;
      }
    };
    ZodLiteral.create = (value, params) => {
      return new ZodLiteral({
        value,
        typeName: ZodFirstPartyTypeKind.ZodLiteral,
        ...processCreateParams(params)
      });
    };
    ZodEnum = class _ZodEnum extends ZodType {
      _parse(input) {
        if (typeof input.data !== "string") {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          addIssueToContext(ctx, {
            expected: util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodIssueCode.invalid_type
          });
          return INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(this._def.values);
        }
        if (!this._cache.has(input.data)) {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return INVALID;
        }
        return OK(input.data);
      }
      get options() {
        return this._def.values;
      }
      get enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Values() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      extract(values, newDef = this._def) {
        return _ZodEnum.create(values, {
          ...this._def,
          ...newDef
        });
      }
      exclude(values, newDef = this._def) {
        return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
          ...this._def,
          ...newDef
        });
      }
    };
    ZodEnum.create = createZodEnum;
    ZodNativeEnum = class extends ZodType {
      _parse(input) {
        const nativeEnumValues = util.getValidEnumValues(this._def.values);
        const ctx = this._getOrReturnCtx(input);
        if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
          const expectedValues = util.objectValues(nativeEnumValues);
          addIssueToContext(ctx, {
            expected: util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodIssueCode.invalid_type
          });
          return INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(util.getValidEnumValues(this._def.values));
        }
        if (!this._cache.has(input.data)) {
          const expectedValues = util.objectValues(nativeEnumValues);
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return INVALID;
        }
        return OK(input.data);
      }
      get enum() {
        return this._def.values;
      }
    };
    ZodNativeEnum.create = (values, params) => {
      return new ZodNativeEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
        ...processCreateParams(params)
      });
    };
    ZodPromise = class extends ZodType {
      unwrap() {
        return this._def.type;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.promise,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
        return OK(promisified.then((data) => {
          return this._def.type.parseAsync(data, {
            path: ctx.path,
            errorMap: ctx.common.contextualErrorMap
          });
        }));
      }
    };
    ZodPromise.create = (schema, params) => {
      return new ZodPromise({
        type: schema,
        typeName: ZodFirstPartyTypeKind.ZodPromise,
        ...processCreateParams(params)
      });
    };
    ZodEffects = class extends ZodType {
      innerType() {
        return this._def.schema;
      }
      sourceType() {
        return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const effect = this._def.effect || null;
        const checkCtx = {
          addIssue: (arg) => {
            addIssueToContext(ctx, arg);
            if (arg.fatal) {
              status.abort();
            } else {
              status.dirty();
            }
          },
          get path() {
            return ctx.path;
          }
        };
        checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
        if (effect.type === "preprocess") {
          const processed = effect.transform(ctx.data, checkCtx);
          if (ctx.common.async) {
            return Promise.resolve(processed).then(async (processed2) => {
              if (status.value === "aborted")
                return INVALID;
              const result = await this._def.schema._parseAsync({
                data: processed2,
                path: ctx.path,
                parent: ctx
              });
              if (result.status === "aborted")
                return INVALID;
              if (result.status === "dirty")
                return DIRTY(result.value);
              if (status.value === "dirty")
                return DIRTY(result.value);
              return result;
            });
          } else {
            if (status.value === "aborted")
              return INVALID;
            const result = this._def.schema._parseSync({
              data: processed,
              path: ctx.path,
              parent: ctx
            });
            if (result.status === "aborted")
              return INVALID;
            if (result.status === "dirty")
              return DIRTY(result.value);
            if (status.value === "dirty")
              return DIRTY(result.value);
            return result;
          }
        }
        if (effect.type === "refinement") {
          const executeRefinement = (acc) => {
            const result = effect.refinement(acc, checkCtx);
            if (ctx.common.async) {
              return Promise.resolve(result);
            }
            if (result instanceof Promise) {
              throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
            }
            return acc;
          };
          if (ctx.common.async === false) {
            const inner = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inner.status === "aborted")
              return INVALID;
            if (inner.status === "dirty")
              status.dirty();
            executeRefinement(inner.value);
            return { status: status.value, value: inner.value };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
              if (inner.status === "aborted")
                return INVALID;
              if (inner.status === "dirty")
                status.dirty();
              return executeRefinement(inner.value).then(() => {
                return { status: status.value, value: inner.value };
              });
            });
          }
        }
        if (effect.type === "transform") {
          if (ctx.common.async === false) {
            const base = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (!isValid(base))
              return INVALID;
            const result = effect.transform(base.value, checkCtx);
            if (result instanceof Promise) {
              throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
            }
            return { status: status.value, value: result };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
              if (!isValid(base))
                return INVALID;
              return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
                status: status.value,
                value: result
              }));
            });
          }
        }
        util.assertNever(effect);
      }
    };
    ZodEffects.create = (schema, effect, params) => {
      return new ZodEffects({
        schema,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect,
        ...processCreateParams(params)
      });
    };
    ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
      return new ZodEffects({
        schema,
        effect: { type: "preprocess", transform: preprocess },
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        ...processCreateParams(params)
      });
    };
    ZodOptional = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.undefined) {
          return OK(void 0);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodOptional.create = (type, params) => {
      return new ZodOptional({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodOptional,
        ...processCreateParams(params)
      });
    };
    ZodNullable = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.null) {
          return OK(null);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodNullable.create = (type, params) => {
      return new ZodNullable({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodNullable,
        ...processCreateParams(params)
      });
    };
    ZodDefault = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        let data = ctx.data;
        if (ctx.parsedType === ZodParsedType.undefined) {
          data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      removeDefault() {
        return this._def.innerType;
      }
    };
    ZodDefault.create = (type, params) => {
      return new ZodDefault({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodDefault,
        defaultValue: typeof params.default === "function" ? params.default : () => params.default,
        ...processCreateParams(params)
      });
    };
    ZodCatch = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const newCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          }
        };
        const result = this._def.innerType._parse({
          data: newCtx.data,
          path: newCtx.path,
          parent: {
            ...newCtx
          }
        });
        if (isAsync(result)) {
          return result.then((result2) => {
            return {
              status: "valid",
              value: result2.status === "valid" ? result2.value : this._def.catchValue({
                get error() {
                  return new ZodError(newCtx.common.issues);
                },
                input: newCtx.data
              })
            };
          });
        } else {
          return {
            status: "valid",
            value: result.status === "valid" ? result.value : this._def.catchValue({
              get error() {
                return new ZodError(newCtx.common.issues);
              },
              input: newCtx.data
            })
          };
        }
      }
      removeCatch() {
        return this._def.innerType;
      }
    };
    ZodCatch.create = (type, params) => {
      return new ZodCatch({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodCatch,
        catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
        ...processCreateParams(params)
      });
    };
    ZodNaN = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.nan) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.nan,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return { status: "valid", value: input.data };
      }
    };
    ZodNaN.create = (params) => {
      return new ZodNaN({
        typeName: ZodFirstPartyTypeKind.ZodNaN,
        ...processCreateParams(params)
      });
    };
    BRAND = Symbol("zod_brand");
    ZodBranded = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const data = ctx.data;
        return this._def.type._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      unwrap() {
        return this._def.type;
      }
    };
    ZodPipeline = class _ZodPipeline extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.common.async) {
          const handleAsync = async () => {
            const inResult = await this._def.in._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inResult.status === "aborted")
              return INVALID;
            if (inResult.status === "dirty") {
              status.dirty();
              return DIRTY(inResult.value);
            } else {
              return this._def.out._parseAsync({
                data: inResult.value,
                path: ctx.path,
                parent: ctx
              });
            }
          };
          return handleAsync();
        } else {
          const inResult = this._def.in._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inResult.status === "aborted")
            return INVALID;
          if (inResult.status === "dirty") {
            status.dirty();
            return {
              status: "dirty",
              value: inResult.value
            };
          } else {
            return this._def.out._parseSync({
              data: inResult.value,
              path: ctx.path,
              parent: ctx
            });
          }
        }
      }
      static create(a, b) {
        return new _ZodPipeline({
          in: a,
          out: b,
          typeName: ZodFirstPartyTypeKind.ZodPipeline
        });
      }
    };
    ZodReadonly = class extends ZodType {
      _parse(input) {
        const result = this._def.innerType._parse(input);
        const freeze = (data) => {
          if (isValid(data)) {
            data.value = Object.freeze(data.value);
          }
          return data;
        };
        return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodReadonly.create = (type, params) => {
      return new ZodReadonly({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodReadonly,
        ...processCreateParams(params)
      });
    };
    late = {
      object: ZodObject.lazycreate
    };
    (function(ZodFirstPartyTypeKind2) {
      ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
      ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
      ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
      ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
      ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
      ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
      ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
      ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
      ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
      ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
      ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
      ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
      ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
      ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
      ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
      ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
      ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
      ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
      ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
      ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
      ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
      ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
      ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
      ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
      ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
      ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
      ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
      ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
      ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
      ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
      ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
      ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
      ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
      ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
      ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
      ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
    })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
    instanceOfType = (cls, params = {
      message: `Input not instance of ${cls.name}`
    }) => custom((data) => data instanceof cls, params);
    stringType = ZodString.create;
    numberType = ZodNumber.create;
    nanType = ZodNaN.create;
    bigIntType = ZodBigInt.create;
    booleanType = ZodBoolean.create;
    dateType = ZodDate.create;
    symbolType = ZodSymbol.create;
    undefinedType = ZodUndefined.create;
    nullType = ZodNull.create;
    anyType = ZodAny.create;
    unknownType = ZodUnknown.create;
    neverType = ZodNever.create;
    voidType = ZodVoid.create;
    arrayType = ZodArray.create;
    objectType = ZodObject.create;
    strictObjectType = ZodObject.strictCreate;
    unionType = ZodUnion.create;
    discriminatedUnionType = ZodDiscriminatedUnion.create;
    intersectionType = ZodIntersection.create;
    tupleType = ZodTuple.create;
    recordType = ZodRecord.create;
    mapType = ZodMap.create;
    setType = ZodSet.create;
    functionType = ZodFunction.create;
    lazyType = ZodLazy.create;
    literalType = ZodLiteral.create;
    enumType = ZodEnum.create;
    nativeEnumType = ZodNativeEnum.create;
    promiseType = ZodPromise.create;
    effectsType = ZodEffects.create;
    optionalType = ZodOptional.create;
    nullableType = ZodNullable.create;
    preprocessType = ZodEffects.createWithPreprocess;
    pipelineType = ZodPipeline.create;
    ostring = () => stringType().optional();
    onumber = () => numberType().optional();
    oboolean = () => booleanType().optional();
    coerce = {
      string: ((arg) => ZodString.create({ ...arg, coerce: true })),
      number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
      boolean: ((arg) => ZodBoolean.create({
        ...arg,
        coerce: true
      })),
      bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
      date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
    };
    NEVER = INVALID;
  }
});

// ../node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});
var init_external = __esm({
  "../node_modules/zod/v3/external.js"() {
    init_errors();
    init_parseUtil();
    init_typeAliases();
    init_util();
    init_types();
    init_ZodError();
  }
});

// ../node_modules/zod/index.js
var init_zod = __esm({
  "../node_modules/zod/index.js"() {
    init_external();
    init_external();
  }
});

// ../node_modules/drizzle-zod/index.mjs
function isColumnType(column, columnTypes) {
  return columnTypes.includes(column.columnType);
}
function isWithEnum(column) {
  return "enumValues" in column && Array.isArray(column.enumValues) && column.enumValues.length > 0;
}
function columnToSchema(column, factory) {
  const z$1 = factory?.zodInstance ?? external_exports;
  const coerce2 = factory?.coerce ?? {};
  let schema;
  if (isWithEnum(column)) {
    schema = column.enumValues.length ? z$1.enum(column.enumValues) : z$1.string();
  }
  if (!schema) {
    if (isColumnType(column, ["PgGeometry", "PgPointTuple"])) {
      schema = z$1.tuple([z$1.number(), z$1.number()]);
    } else if (isColumnType(column, ["PgGeometryObject", "PgPointObject"])) {
      schema = z$1.object({ x: z$1.number(), y: z$1.number() });
    } else if (isColumnType(column, ["PgHalfVector", "PgVector"])) {
      schema = z$1.array(z$1.number());
      schema = column.dimensions ? schema.length(column.dimensions) : schema;
    } else if (isColumnType(column, ["PgLine"])) {
      schema = z$1.tuple([z$1.number(), z$1.number(), z$1.number()]);
    } else if (isColumnType(column, ["PgLineABC"])) {
      schema = z$1.object({
        a: z$1.number(),
        b: z$1.number(),
        c: z$1.number()
      });
    } else if (isColumnType(column, ["PgArray"])) {
      schema = z$1.array(columnToSchema(column.baseColumn, z$1));
      schema = column.size ? schema.length(column.size) : schema;
    } else if (column.dataType === "array") {
      schema = z$1.array(z$1.any());
    } else if (column.dataType === "number") {
      schema = numberColumnToSchema(column, z$1, coerce2);
    } else if (column.dataType === "bigint") {
      schema = bigintColumnToSchema(column, z$1, coerce2);
    } else if (column.dataType === "boolean") {
      schema = coerce2 === true || coerce2.boolean ? z$1.coerce.boolean() : z$1.boolean();
    } else if (column.dataType === "date") {
      schema = coerce2 === true || coerce2.date ? z$1.coerce.date() : z$1.date();
    } else if (column.dataType === "string") {
      schema = stringColumnToSchema(column, z$1, coerce2);
    } else if (column.dataType === "json") {
      schema = jsonSchema;
    } else if (column.dataType === "custom") {
      schema = z$1.any();
    } else if (column.dataType === "buffer") {
      schema = bufferSchema;
    }
  }
  if (!schema) {
    schema = z$1.any();
  }
  return schema;
}
function numberColumnToSchema(column, z, coerce2) {
  let unsigned = column.getSQLType().includes("unsigned");
  let min;
  let max;
  let integer2 = false;
  if (isColumnType(column, ["MySqlTinyInt", "SingleStoreTinyInt"])) {
    min = unsigned ? 0 : CONSTANTS.INT8_MIN;
    max = unsigned ? CONSTANTS.INT8_UNSIGNED_MAX : CONSTANTS.INT8_MAX;
    integer2 = true;
  } else if (isColumnType(column, [
    "PgSmallInt",
    "PgSmallSerial",
    "MySqlSmallInt",
    "SingleStoreSmallInt"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT16_MIN;
    max = unsigned ? CONSTANTS.INT16_UNSIGNED_MAX : CONSTANTS.INT16_MAX;
    integer2 = true;
  } else if (isColumnType(column, [
    "PgReal",
    "MySqlFloat",
    "MySqlMediumInt",
    "SingleStoreMediumInt",
    "SingleStoreFloat"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT24_MIN;
    max = unsigned ? CONSTANTS.INT24_UNSIGNED_MAX : CONSTANTS.INT24_MAX;
    integer2 = isColumnType(column, ["MySqlMediumInt", "SingleStoreMediumInt"]);
  } else if (isColumnType(column, [
    "PgInteger",
    "PgSerial",
    "MySqlInt",
    "SingleStoreInt"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT32_MIN;
    max = unsigned ? CONSTANTS.INT32_UNSIGNED_MAX : CONSTANTS.INT32_MAX;
    integer2 = true;
  } else if (isColumnType(column, [
    "PgDoublePrecision",
    "MySqlReal",
    "MySqlDouble",
    "SingleStoreReal",
    "SingleStoreDouble",
    "SQLiteReal"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT48_MIN;
    max = unsigned ? CONSTANTS.INT48_UNSIGNED_MAX : CONSTANTS.INT48_MAX;
  } else if (isColumnType(column, [
    "PgBigInt53",
    "PgBigSerial53",
    "MySqlBigInt53",
    "MySqlSerial",
    "SingleStoreBigInt53",
    "SingleStoreSerial",
    "SQLiteInteger"
  ])) {
    unsigned = unsigned || isColumnType(column, ["MySqlSerial", "SingleStoreSerial"]);
    min = unsigned ? 0 : Number.MIN_SAFE_INTEGER;
    max = Number.MAX_SAFE_INTEGER;
    integer2 = true;
  } else if (isColumnType(column, ["MySqlYear", "SingleStoreYear"])) {
    min = 1901;
    max = 2155;
    integer2 = true;
  } else {
    min = Number.MIN_SAFE_INTEGER;
    max = Number.MAX_SAFE_INTEGER;
  }
  let schema = coerce2 === true || coerce2?.number ? z.coerce.number() : z.number();
  schema = schema.min(min).max(max);
  return integer2 ? schema.int() : schema;
}
function bigintColumnToSchema(column, z, coerce2) {
  const unsigned = column.getSQLType().includes("unsigned");
  const min = unsigned ? 0n : CONSTANTS.INT64_MIN;
  const max = unsigned ? CONSTANTS.INT64_UNSIGNED_MAX : CONSTANTS.INT64_MAX;
  const schema = coerce2 === true || coerce2?.bigint ? z.coerce.bigint() : z.bigint();
  return schema.min(min).max(max);
}
function stringColumnToSchema(column, z, coerce2) {
  if (isColumnType(column, ["PgUUID"])) {
    return z.string().uuid();
  }
  let max;
  let regex;
  let fixed = false;
  if (isColumnType(column, ["PgVarchar", "SQLiteText"])) {
    max = column.length;
  } else if (isColumnType(column, ["MySqlVarChar", "SingleStoreVarChar"])) {
    max = column.length ?? CONSTANTS.INT16_UNSIGNED_MAX;
  } else if (isColumnType(column, ["MySqlText", "SingleStoreText"])) {
    if (column.textType === "longtext") {
      max = CONSTANTS.INT32_UNSIGNED_MAX;
    } else if (column.textType === "mediumtext") {
      max = CONSTANTS.INT24_UNSIGNED_MAX;
    } else if (column.textType === "text") {
      max = CONSTANTS.INT16_UNSIGNED_MAX;
    } else {
      max = CONSTANTS.INT8_UNSIGNED_MAX;
    }
  }
  if (isColumnType(column, [
    "PgChar",
    "MySqlChar",
    "SingleStoreChar"
  ])) {
    max = column.length;
    fixed = true;
  }
  if (isColumnType(column, ["PgBinaryVector"])) {
    regex = /^[01]+$/;
    max = column.dimensions;
  }
  let schema = coerce2 === true || coerce2?.string ? z.coerce.string() : z.string();
  schema = regex ? schema.regex(regex) : schema;
  return max && fixed ? schema.length(max) : max ? schema.max(max) : schema;
}
function getColumns(tableLike) {
  return (0, import_drizzle_orm2.isTable)(tableLike) ? (0, import_drizzle_orm2.getTableColumns)(tableLike) : (0, import_drizzle_orm2.getViewSelectedFields)(tableLike);
}
function handleColumns(columns, refinements, conditions, factory) {
  const columnSchemas = {};
  for (const [key, selected] of Object.entries(columns)) {
    if (!(0, import_drizzle_orm2.is)(selected, import_drizzle_orm2.Column) && !(0, import_drizzle_orm2.is)(selected, import_drizzle_orm2.SQL) && !(0, import_drizzle_orm2.is)(selected, import_drizzle_orm2.SQL.Aliased) && typeof selected === "object") {
      const columns2 = (0, import_drizzle_orm2.isTable)(selected) || (0, import_drizzle_orm2.isView)(selected) ? getColumns(selected) : selected;
      columnSchemas[key] = handleColumns(columns2, refinements[key] ?? {}, conditions, factory);
      continue;
    }
    const refinement = refinements[key];
    if (refinement !== void 0 && typeof refinement !== "function") {
      columnSchemas[key] = refinement;
      continue;
    }
    const column = (0, import_drizzle_orm2.is)(selected, import_drizzle_orm2.Column) ? selected : void 0;
    const schema = column ? columnToSchema(column, factory) : external_exports.any();
    const refined = typeof refinement === "function" ? refinement(schema) : schema;
    if (conditions.never(column)) {
      continue;
    } else {
      columnSchemas[key] = refined;
    }
    if (column) {
      if (conditions.nullable(column)) {
        columnSchemas[key] = columnSchemas[key].nullable();
      }
      if (conditions.optional(column)) {
        columnSchemas[key] = columnSchemas[key].optional();
      }
    }
  }
  return external_exports.object(columnSchemas);
}
var import_drizzle_orm2, CONSTANTS, literalSchema, jsonSchema, bufferSchema, insertConditions, createInsertSchema;
var init_drizzle_zod = __esm({
  "../node_modules/drizzle-zod/index.mjs"() {
    init_zod();
    import_drizzle_orm2 = require("drizzle-orm");
    CONSTANTS = {
      INT8_MIN: -128,
      INT8_MAX: 127,
      INT8_UNSIGNED_MAX: 255,
      INT16_MIN: -32768,
      INT16_MAX: 32767,
      INT16_UNSIGNED_MAX: 65535,
      INT24_MIN: -8388608,
      INT24_MAX: 8388607,
      INT24_UNSIGNED_MAX: 16777215,
      INT32_MIN: -2147483648,
      INT32_MAX: 2147483647,
      INT32_UNSIGNED_MAX: 4294967295,
      INT48_MIN: -140737488355328,
      INT48_MAX: 140737488355327,
      INT48_UNSIGNED_MAX: 281474976710655,
      INT64_MIN: -9223372036854775808n,
      INT64_MAX: 9223372036854775807n,
      INT64_UNSIGNED_MAX: 18446744073709551615n
    };
    literalSchema = external_exports.union([external_exports.string(), external_exports.number(), external_exports.boolean(), external_exports.null()]);
    jsonSchema = external_exports.union([literalSchema, external_exports.record(external_exports.any()), external_exports.array(external_exports.any())]);
    bufferSchema = external_exports.custom((v) => v instanceof Buffer);
    insertConditions = {
      never: (column) => column?.generated?.type === "always" || column?.generatedIdentity?.type === "always",
      optional: (column) => !column.notNull || column.notNull && column.hasDefault,
      nullable: (column) => !column.notNull
    };
    createInsertSchema = (entity, refine) => {
      const columns = getColumns(entity);
      return handleColumns(columns, refine ?? {}, insertConditions);
    };
  }
});

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  DECISIVE_LEVELS: () => DECISIVE_LEVELS,
  RARITY_SUPPLY: () => RARITY_SUPPLY,
  SITE_FEE_RATE: () => SITE_FEE_RATE,
  calculateDecisiveLevel: () => calculateDecisiveLevel,
  competitionEntries: () => competitionEntries,
  competitionEntriesRelations: () => competitionEntriesRelations,
  competitionStatusEnum: () => competitionStatusEnum,
  competitionTierEnum: () => competitionTierEnum,
  competitions: () => competitions,
  competitionsRelations: () => competitionsRelations,
  eplFixtures: () => eplFixtures,
  eplInjuries: () => eplInjuries,
  eplPlayers: () => eplPlayers,
  eplStandings: () => eplStandings,
  eplSyncLog: () => eplSyncLog,
  insertCompetitionEntrySchema: () => insertCompetitionEntrySchema,
  insertCompetitionSchema: () => insertCompetitionSchema,
  insertLineupSchema: () => insertLineupSchema,
  insertMarketplaceTradeSchema: () => insertMarketplaceTradeSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertOnboardingSchema: () => insertOnboardingSchema,
  insertPlayerCardSchema: () => insertPlayerCardSchema,
  insertPlayerSchema: () => insertPlayerSchema,
  insertSwapOfferSchema: () => insertSwapOfferSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserTradeHistorySchema: () => insertUserTradeHistorySchema,
  insertWalletSchema: () => insertWalletSchema,
  insertWithdrawalRequestSchema: () => insertWithdrawalRequestSchema,
  lineups: () => lineups,
  lineupsRelations: () => lineupsRelations,
  marketplaceTrades: () => marketplaceTrades,
  marketplaceTradesRelations: () => marketplaceTradesRelations,
  notificationTypeEnum: () => notificationTypeEnum,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  paymentMethodEnum: () => paymentMethodEnum,
  playerCards: () => playerCards,
  playerCardsRelations: () => playerCardsRelations,
  players: () => players,
  playersRelations: () => playersRelations,
  positionEnum: () => positionEnum,
  rarityEnum: () => rarityEnum,
  sessions: () => sessions,
  swapOffers: () => swapOffers,
  swapOffersRelations: () => swapOffersRelations,
  swapStatusEnum: () => swapStatusEnum,
  tradeTypeEnum: () => tradeTypeEnum,
  transactionTypeEnum: () => transactionTypeEnum,
  transactions: () => transactions,
  transactionsRelations: () => transactionsRelations,
  userOnboarding: () => userOnboarding,
  userOnboardingRelations: () => userOnboardingRelations,
  userTradeHistory: () => userTradeHistory,
  userTradeHistoryRelations: () => userTradeHistoryRelations,
  users: () => users,
  wallets: () => wallets,
  walletsRelations: () => walletsRelations,
  withdrawalRequests: () => withdrawalRequests,
  withdrawalRequestsRelations: () => withdrawalRequestsRelations,
  withdrawalStatusEnum: () => withdrawalStatusEnum
});
function calculateDecisiveLevel(stats) {
  const positives = (stats.goals ?? 0) + (stats.assists ?? 0) + (stats.cleanSheets ?? 0) + (stats.penaltySaves ?? 0);
  const negatives = (stats.redCards ?? 0) + (stats.ownGoals ?? 0) + (stats.errorsLeadingToGoal ?? 0);
  const rawLevel = Math.max(0, Math.min(5, positives - negatives));
  return DECISIVE_LEVELS[rawLevel];
}
var import_drizzle_orm3, import_pg_core2, rarityEnum, positionEnum, transactionTypeEnum, competitionTierEnum, competitionStatusEnum, swapStatusEnum, withdrawalStatusEnum, paymentMethodEnum, players, RARITY_SUPPLY, DECISIVE_LEVELS, playerCards, wallets, transactions, lineups, userOnboarding, competitions, competitionEntries, swapOffers, withdrawalRequests, notificationTypeEnum, notifications, tradeTypeEnum, userTradeHistory, marketplaceTrades, SITE_FEE_RATE, eplPlayers, eplFixtures, eplInjuries, eplStandings, eplSyncLog, playersRelations, playerCardsRelations, walletsRelations, transactionsRelations, lineupsRelations, userOnboardingRelations, competitionsRelations, competitionEntriesRelations, swapOffersRelations, withdrawalRequestsRelations, notificationsRelations, userTradeHistoryRelations, marketplaceTradesRelations, insertPlayerSchema, insertPlayerCardSchema, insertWalletSchema, insertTransactionSchema, insertLineupSchema, insertOnboardingSchema, insertCompetitionSchema, insertCompetitionEntrySchema, insertSwapOfferSchema, insertWithdrawalRequestSchema, insertNotificationSchema, insertUserTradeHistorySchema, insertMarketplaceTradeSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    init_auth();
    import_drizzle_orm3 = require("drizzle-orm");
    import_pg_core2 = require("drizzle-orm/pg-core");
    init_drizzle_zod();
    init_auth();
    rarityEnum = (0, import_pg_core2.pgEnum)("rarity", ["common", "rare", "unique", "epic", "legendary"]);
    positionEnum = (0, import_pg_core2.pgEnum)("position", ["GK", "DEF", "MID", "FWD"]);
    transactionTypeEnum = (0, import_pg_core2.pgEnum)("transaction_type", ["deposit", "withdrawal", "purchase", "sale", "entry_fee", "prize", "swap_fee"]);
    competitionTierEnum = (0, import_pg_core2.pgEnum)("competition_tier", ["common", "rare"]);
    competitionStatusEnum = (0, import_pg_core2.pgEnum)("competition_status", ["open", "active", "completed"]);
    swapStatusEnum = (0, import_pg_core2.pgEnum)("swap_status", ["pending", "accepted", "rejected", "cancelled"]);
    withdrawalStatusEnum = (0, import_pg_core2.pgEnum)("withdrawal_status", ["pending", "processing", "completed", "rejected"]);
    paymentMethodEnum = (0, import_pg_core2.pgEnum)("payment_method", ["eft", "ewallet", "bank_transfer", "mobile_money", "other"]);
    players = (0, import_pg_core2.pgTable)("players", {
      id: (0, import_pg_core2.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
      name: (0, import_pg_core2.text)("name").notNull(),
      team: (0, import_pg_core2.text)("team").notNull(),
      league: (0, import_pg_core2.text)("league").notNull(),
      position: positionEnum("position").notNull(),
      nationality: (0, import_pg_core2.text)("nationality").notNull(),
      age: (0, import_pg_core2.integer)("age").notNull(),
      overall: (0, import_pg_core2.integer)("overall").notNull(),
      imageUrl: (0, import_pg_core2.text)("image_url")
    });
    RARITY_SUPPLY = {
      common: 0,
      rare: 100,
      unique: 1,
      epic: 10,
      legendary: 5
    };
    DECISIVE_LEVELS = [
      { level: 0, points: 35 },
      { level: 1, points: 60 },
      { level: 2, points: 70 },
      { level: 3, points: 80 },
      { level: 4, points: 90 },
      { level: 5, points: 100 }
    ];
    playerCards = (0, import_pg_core2.pgTable)("player_cards", {
      id: (0, import_pg_core2.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
      playerId: (0, import_pg_core2.integer)("player_id").notNull().references(() => players.id),
      ownerId: (0, import_pg_core2.varchar)("owner_id").references(() => users.id),
      rarity: rarityEnum("rarity").notNull().default("common"),
      serialId: (0, import_pg_core2.text)("serial_id").unique(),
      serialNumber: (0, import_pg_core2.integer)("serial_number"),
      maxSupply: (0, import_pg_core2.integer)("max_supply").default(0),
      level: (0, import_pg_core2.integer)("level").notNull().default(1),
      xp: (0, import_pg_core2.integer)("xp").notNull().default(0),
      decisiveScore: (0, import_pg_core2.integer)("decisive_score").default(35),
      last5Scores: (0, import_pg_core2.jsonb)("last_5_scores").$type().default([0, 0, 0, 0, 0]),
      forSale: (0, import_pg_core2.boolean)("for_sale").notNull().default(false),
      price: (0, import_pg_core2.real)("price").default(0),
      acquiredAt: (0, import_pg_core2.timestamp)("acquired_at").defaultNow()
    });
    wallets = (0, import_pg_core2.pgTable)("wallets", {
      id: (0, import_pg_core2.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
      userId: (0, import_pg_core2.varchar)("user_id").notNull().references(() => users.id).unique(),
      balance: (0, import_pg_core2.real)("balance").notNull().default(0),
      lockedBalance: (0, import_pg_core2.real)("locked_balance").notNull().default(0)
    });
    transactions = (0, import_pg_core2.pgTable)("transactions", {
      id: (0, import_pg_core2.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
      userId: (0, import_pg_core2.varchar)("user_id").notNull().references(() => users.id),
      type: transactionTypeEnum("type").notNull(),
      amount: (0, import_pg_core2.real)("amount").notNull(),
      description: (0, import_pg_core2.text)("description"),
      paymentMethod: (0, import_pg_core2.text)("payment_method"),
      externalTransactionId: (0, import_pg_core2.text)("external_transaction_id"),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    });
    lineups = (0, import_pg_core2.pgTable)("lineups", {
      id: (0, import_pg_core2.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
      userId: (0, import_pg_core2.varchar)("user_id").notNull().references(() => users.id).unique(),
      cardIds: (0, import_pg_core2.jsonb)("card_ids").$type().notNull().default([]),
      captainId: (0, import_pg_core2.integer)("captain_id").references(() => playerCards.id)
    });
    userOnboarding = (0, import_pg_core2.pgTable)("user_onboarding", {
      id: (0, import_pg_core2.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
      userId: (0, import_pg_core2.varchar)("user_id").notNull().references(() => users.id).unique(),
      completed: (0, import_pg_core2.boolean)("completed").notNull().default(false),
      packCards: (0, import_pg_core2.jsonb)("pack_cards").$type().default([]),
      selectedCards: (0, import_pg_core2.jsonb)("selected_cards").$type().default([])
    });
    competitions = (0, import_pg_core2.pgTable)("competitions", {
      id: (0, import_pg_core2.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
      name: (0, import_pg_core2.text)("name").notNull(),
      tier: competitionTierEnum("tier").notNull(),
      entryFee: (0, import_pg_core2.real)("entry_fee").notNull().default(0),
      status: competitionStatusEnum("status").notNull().default("open"),
      gameWeek: (0, import_pg_core2.integer)("game_week").notNull(),
      startDate: (0, import_pg_core2.timestamp)("start_date").notNull(),
      endDate: (0, import_pg_core2.timestamp)("end_date").notNull(),
      prizeCardRarity: rarityEnum("prize_card_rarity"),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    });
    competitionEntries = (0, import_pg_core2.pgTable)("competition_entries", {
      id: (0, import_pg_core2.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
      competitionId: (0, import_pg_core2.integer)("competition_id").notNull().references(() => competitions.id),
      userId: (0, import_pg_core2.varchar)("user_id").notNull().references(() => users.id),
      lineupCardIds: (0, import_pg_core2.jsonb)("lineup_card_ids").$type().notNull().default([]),
      captainId: (0, import_pg_core2.integer)("captain_id"),
      totalScore: (0, import_pg_core2.real)("total_score").notNull().default(0),
      rank: (0, import_pg_core2.integer)("rank"),
      prizeAmount: (0, import_pg_core2.real)("prize_amount").default(0),
      prizeCardId: (0, import_pg_core2.integer)("prize_card_id").references(() => playerCards.id),
      joinedAt: (0, import_pg_core2.timestamp)("joined_at").defaultNow()
    });
    swapOffers = (0, import_pg_core2.pgTable)("swap_offers", {
      id: (0, import_pg_core2.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
      offererUserId: (0, import_pg_core2.varchar)("offerer_user_id").notNull().references(() => users.id),
      receiverUserId: (0, import_pg_core2.varchar)("receiver_user_id").notNull().references(() => users.id),
      offeredCardId: (0, import_pg_core2.integer)("offered_card_id").notNull().references(() => playerCards.id),
      requestedCardId: (0, import_pg_core2.integer)("requested_card_id").notNull().references(() => playerCards.id),
      topUpAmount: (0, import_pg_core2.real)("top_up_amount").default(0),
      topUpDirection: (0, import_pg_core2.text)("top_up_direction").default("none"),
      status: swapStatusEnum("status").notNull().default("pending"),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    });
    withdrawalRequests = (0, import_pg_core2.pgTable)("withdrawal_requests", {
      id: (0, import_pg_core2.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
      userId: (0, import_pg_core2.varchar)("user_id").notNull().references(() => users.id),
      amount: (0, import_pg_core2.real)("amount").notNull(),
      fee: (0, import_pg_core2.real)("fee").notNull().default(0),
      netAmount: (0, import_pg_core2.real)("net_amount").notNull(),
      paymentMethod: (0, import_pg_core2.text)("payment_method").notNull(),
      bankName: (0, import_pg_core2.text)("bank_name"),
      accountHolder: (0, import_pg_core2.text)("account_holder"),
      accountNumber: (0, import_pg_core2.text)("account_number"),
      iban: (0, import_pg_core2.text)("iban"),
      swiftCode: (0, import_pg_core2.text)("swift_code"),
      ewalletProvider: (0, import_pg_core2.text)("ewallet_provider"),
      ewalletId: (0, import_pg_core2.text)("ewallet_id"),
      status: withdrawalStatusEnum("status").notNull().default("pending"),
      adminNotes: (0, import_pg_core2.text)("admin_notes"),
      reviewedAt: (0, import_pg_core2.timestamp)("reviewed_at"),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    });
    notificationTypeEnum = (0, import_pg_core2.pgEnum)("notification_type", ["reward", "prize", "trade", "system"]);
    notifications = (0, import_pg_core2.pgTable)("notifications", {
      id: (0, import_pg_core2.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
      userId: (0, import_pg_core2.varchar)("user_id").notNull().references(() => users.id),
      type: notificationTypeEnum("type").notNull(),
      title: (0, import_pg_core2.text)("title").notNull(),
      message: (0, import_pg_core2.text)("message").notNull(),
      amount: (0, import_pg_core2.real)("amount").default(0),
      isRead: (0, import_pg_core2.boolean)("is_read").notNull().default(false),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    });
    tradeTypeEnum = (0, import_pg_core2.pgEnum)("trade_type", ["sell", "buy", "swap"]);
    userTradeHistory = (0, import_pg_core2.pgTable)("user_trade_history", {
      id: (0, import_pg_core2.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
      userId: (0, import_pg_core2.varchar)("user_id").notNull().references(() => users.id),
      tradeType: tradeTypeEnum("trade_type").notNull(),
      cardId: (0, import_pg_core2.integer)("card_id").references(() => playerCards.id),
      amount: (0, import_pg_core2.real)("amount").default(0),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    });
    marketplaceTrades = (0, import_pg_core2.pgTable)("marketplace_trades", {
      id: (0, import_pg_core2.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
      sellerId: (0, import_pg_core2.varchar)("seller_id").notNull().references(() => users.id),
      buyerId: (0, import_pg_core2.varchar)("buyer_id").notNull().references(() => users.id),
      cardId: (0, import_pg_core2.integer)("card_id").notNull().references(() => playerCards.id),
      price: (0, import_pg_core2.real)("price").notNull(),
      fee: (0, import_pg_core2.real)("fee").notNull(),
      totalAmount: (0, import_pg_core2.real)("total_amount").notNull(),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    });
    SITE_FEE_RATE = 0.08;
    eplPlayers = (0, import_pg_core2.pgTable)("epl_players", {
      id: (0, import_pg_core2.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
      apiId: (0, import_pg_core2.integer)("api_id").notNull().unique(),
      name: (0, import_pg_core2.text)("name").notNull(),
      firstname: (0, import_pg_core2.text)("firstname"),
      lastname: (0, import_pg_core2.text)("lastname"),
      age: (0, import_pg_core2.integer)("age"),
      nationality: (0, import_pg_core2.text)("nationality"),
      photo: (0, import_pg_core2.text)("photo"),
      team: (0, import_pg_core2.text)("team"),
      teamLogo: (0, import_pg_core2.text)("team_logo"),
      teamId: (0, import_pg_core2.integer)("team_id"),
      position: (0, import_pg_core2.text)("epl_position"),
      number: (0, import_pg_core2.integer)("number"),
      goals: (0, import_pg_core2.integer)("goals").default(0),
      assists: (0, import_pg_core2.integer)("assists").default(0),
      yellowCards: (0, import_pg_core2.integer)("yellow_cards").default(0),
      redCards: (0, import_pg_core2.integer)("red_cards").default(0),
      appearances: (0, import_pg_core2.integer)("appearances").default(0),
      minutes: (0, import_pg_core2.integer)("minutes").default(0),
      rating: (0, import_pg_core2.text)("rating"),
      injured: (0, import_pg_core2.boolean)("injured").default(false),
      season: (0, import_pg_core2.integer)("season").notNull().default(2024),
      lastUpdated: (0, import_pg_core2.timestamp)("last_updated").defaultNow()
    });
    eplFixtures = (0, import_pg_core2.pgTable)("epl_fixtures", {
      id: (0, import_pg_core2.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
      apiId: (0, import_pg_core2.integer)("api_id").notNull().unique(),
      homeTeam: (0, import_pg_core2.text)("home_team").notNull(),
      homeTeamLogo: (0, import_pg_core2.text)("home_team_logo"),
      homeTeamId: (0, import_pg_core2.integer)("home_team_id"),
      awayTeam: (0, import_pg_core2.text)("away_team").notNull(),
      awayTeamLogo: (0, import_pg_core2.text)("away_team_logo"),
      awayTeamId: (0, import_pg_core2.integer)("away_team_id"),
      homeGoals: (0, import_pg_core2.integer)("home_goals"),
      awayGoals: (0, import_pg_core2.integer)("away_goals"),
      status: (0, import_pg_core2.text)("fixture_status").notNull().default("NS"),
      statusLong: (0, import_pg_core2.text)("status_long").default("Not Started"),
      elapsed: (0, import_pg_core2.integer)("elapsed"),
      venue: (0, import_pg_core2.text)("venue"),
      referee: (0, import_pg_core2.text)("referee"),
      round: (0, import_pg_core2.text)("round"),
      matchDate: (0, import_pg_core2.timestamp)("match_date").notNull(),
      season: (0, import_pg_core2.integer)("season").notNull().default(2024),
      lastUpdated: (0, import_pg_core2.timestamp)("last_updated").defaultNow()
    });
    eplInjuries = (0, import_pg_core2.pgTable)("epl_injuries", {
      id: (0, import_pg_core2.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
      playerApiId: (0, import_pg_core2.integer)("player_api_id").notNull(),
      playerName: (0, import_pg_core2.text)("player_name").notNull(),
      playerPhoto: (0, import_pg_core2.text)("player_photo"),
      team: (0, import_pg_core2.text)("team").notNull(),
      teamLogo: (0, import_pg_core2.text)("team_logo"),
      type: (0, import_pg_core2.text)("injury_type"),
      reason: (0, import_pg_core2.text)("reason"),
      fixtureApiId: (0, import_pg_core2.integer)("fixture_api_id"),
      fixtureDate: (0, import_pg_core2.timestamp)("fixture_date"),
      season: (0, import_pg_core2.integer)("season").notNull().default(2024),
      lastUpdated: (0, import_pg_core2.timestamp)("last_updated").defaultNow()
    });
    eplStandings = (0, import_pg_core2.pgTable)("epl_standings", {
      id: (0, import_pg_core2.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
      teamId: (0, import_pg_core2.integer)("team_id").notNull().unique(),
      teamName: (0, import_pg_core2.text)("team_name").notNull(),
      teamLogo: (0, import_pg_core2.text)("team_logo"),
      rank: (0, import_pg_core2.integer)("rank").notNull(),
      points: (0, import_pg_core2.integer)("points").notNull().default(0),
      played: (0, import_pg_core2.integer)("played").notNull().default(0),
      won: (0, import_pg_core2.integer)("won").notNull().default(0),
      drawn: (0, import_pg_core2.integer)("drawn").notNull().default(0),
      lost: (0, import_pg_core2.integer)("lost").notNull().default(0),
      goalsFor: (0, import_pg_core2.integer)("goals_for").notNull().default(0),
      goalsAgainst: (0, import_pg_core2.integer)("goals_against").notNull().default(0),
      goalDiff: (0, import_pg_core2.integer)("goal_diff").notNull().default(0),
      form: (0, import_pg_core2.text)("form"),
      season: (0, import_pg_core2.integer)("season").notNull().default(2024),
      lastUpdated: (0, import_pg_core2.timestamp)("last_updated").defaultNow()
    });
    eplSyncLog = (0, import_pg_core2.pgTable)("epl_sync_log", {
      id: (0, import_pg_core2.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
      endpoint: (0, import_pg_core2.text)("endpoint").notNull(),
      syncedAt: (0, import_pg_core2.timestamp)("synced_at").defaultNow(),
      recordCount: (0, import_pg_core2.integer)("record_count").default(0)
    });
    playersRelations = (0, import_drizzle_orm3.relations)(players, ({ many }) => ({
      cards: many(playerCards)
    }));
    playerCardsRelations = (0, import_drizzle_orm3.relations)(playerCards, ({ one }) => ({
      player: one(players, { fields: [playerCards.playerId], references: [players.id] }),
      owner: one(users, { fields: [playerCards.ownerId], references: [users.id] })
    }));
    walletsRelations = (0, import_drizzle_orm3.relations)(wallets, ({ one }) => ({
      user: one(users, { fields: [wallets.userId], references: [users.id] })
    }));
    transactionsRelations = (0, import_drizzle_orm3.relations)(transactions, ({ one }) => ({
      user: one(users, { fields: [transactions.userId], references: [users.id] })
    }));
    lineupsRelations = (0, import_drizzle_orm3.relations)(lineups, ({ one }) => ({
      user: one(users, { fields: [lineups.userId], references: [users.id] })
    }));
    userOnboardingRelations = (0, import_drizzle_orm3.relations)(userOnboarding, ({ one }) => ({
      user: one(users, { fields: [userOnboarding.userId], references: [users.id] })
    }));
    competitionsRelations = (0, import_drizzle_orm3.relations)(competitions, ({ many }) => ({
      entries: many(competitionEntries)
    }));
    competitionEntriesRelations = (0, import_drizzle_orm3.relations)(competitionEntries, ({ one }) => ({
      competition: one(competitions, { fields: [competitionEntries.competitionId], references: [competitions.id] }),
      user: one(users, { fields: [competitionEntries.userId], references: [users.id] })
    }));
    swapOffersRelations = (0, import_drizzle_orm3.relations)(swapOffers, ({ one }) => ({
      offerer: one(users, { fields: [swapOffers.offererUserId], references: [users.id] })
    }));
    withdrawalRequestsRelations = (0, import_drizzle_orm3.relations)(withdrawalRequests, ({ one }) => ({
      user: one(users, { fields: [withdrawalRequests.userId], references: [users.id] })
    }));
    notificationsRelations = (0, import_drizzle_orm3.relations)(notifications, ({ one }) => ({
      user: one(users, { fields: [notifications.userId], references: [users.id] })
    }));
    userTradeHistoryRelations = (0, import_drizzle_orm3.relations)(userTradeHistory, ({ one }) => ({
      user: one(users, { fields: [userTradeHistory.userId], references: [users.id] }),
      card: one(playerCards, { fields: [userTradeHistory.cardId], references: [playerCards.id] })
    }));
    marketplaceTradesRelations = (0, import_drizzle_orm3.relations)(marketplaceTrades, ({ one }) => ({
      seller: one(users, { fields: [marketplaceTrades.sellerId], references: [users.id] }),
      buyer: one(users, { fields: [marketplaceTrades.buyerId], references: [users.id] }),
      card: one(playerCards, { fields: [marketplaceTrades.cardId], references: [playerCards.id] })
    }));
    insertPlayerSchema = createInsertSchema(players);
    insertPlayerCardSchema = createInsertSchema(playerCards);
    insertWalletSchema = createInsertSchema(wallets);
    insertTransactionSchema = createInsertSchema(transactions);
    insertLineupSchema = createInsertSchema(lineups);
    insertOnboardingSchema = createInsertSchema(userOnboarding);
    insertCompetitionSchema = createInsertSchema(competitions);
    insertCompetitionEntrySchema = createInsertSchema(competitionEntries);
    insertSwapOfferSchema = createInsertSchema(swapOffers);
    insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests);
    insertNotificationSchema = createInsertSchema(notifications);
    insertUserTradeHistorySchema = createInsertSchema(userTradeHistory);
    insertMarketplaceTradeSchema = createInsertSchema(marketplaceTrades);
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  pool: () => pool
});
var import_node_postgres, import_pg, Pool, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    import_node_postgres = require("drizzle-orm/node-postgres");
    import_pg = __toESM(require("pg"));
    init_schema();
    ({ Pool } = import_pg.default);
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });
  }
});

// ../node_modules/es5-ext/function/noop.js
var require_noop = __commonJS({
  "../node_modules/es5-ext/function/noop.js"(exports2, module2) {
    "use strict";
    module2.exports = function() {
    };
  }
});

// ../node_modules/es5-ext/object/is-value.js
var require_is_value = __commonJS({
  "../node_modules/es5-ext/object/is-value.js"(exports2, module2) {
    "use strict";
    var _undefined = require_noop()();
    module2.exports = function(val) {
      return val !== _undefined && val !== null;
    };
  }
});

// ../node_modules/es5-ext/object/normalize-options.js
var require_normalize_options = __commonJS({
  "../node_modules/es5-ext/object/normalize-options.js"(exports2, module2) {
    "use strict";
    var isValue = require_is_value();
    var forEach = Array.prototype.forEach;
    var create = Object.create;
    var process2 = function(src, obj) {
      var key;
      for (key in src) obj[key] = src[key];
    };
    module2.exports = function(opts1) {
      var result = create(null);
      forEach.call(arguments, function(options) {
        if (!isValue(options)) return;
        process2(Object(options), result);
      });
      return result;
    };
  }
});

// ../node_modules/es5-ext/math/sign/is-implemented.js
var require_is_implemented = __commonJS({
  "../node_modules/es5-ext/math/sign/is-implemented.js"(exports2, module2) {
    "use strict";
    module2.exports = function() {
      var sign = Math.sign;
      if (typeof sign !== "function") return false;
      return sign(10) === 1 && sign(-20) === -1;
    };
  }
});

// ../node_modules/es5-ext/math/sign/shim.js
var require_shim = __commonJS({
  "../node_modules/es5-ext/math/sign/shim.js"(exports2, module2) {
    "use strict";
    module2.exports = function(value) {
      value = Number(value);
      if (isNaN(value) || value === 0) return value;
      return value > 0 ? 1 : -1;
    };
  }
});

// ../node_modules/es5-ext/math/sign/index.js
var require_sign = __commonJS({
  "../node_modules/es5-ext/math/sign/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_is_implemented()() ? Math.sign : require_shim();
  }
});

// ../node_modules/es5-ext/number/to-integer.js
var require_to_integer = __commonJS({
  "../node_modules/es5-ext/number/to-integer.js"(exports2, module2) {
    "use strict";
    var sign = require_sign();
    var abs = Math.abs;
    var floor = Math.floor;
    module2.exports = function(value) {
      if (isNaN(value)) return 0;
      value = Number(value);
      if (value === 0 || !isFinite(value)) return value;
      return sign(value) * floor(abs(value));
    };
  }
});

// ../node_modules/es5-ext/number/to-pos-integer.js
var require_to_pos_integer = __commonJS({
  "../node_modules/es5-ext/number/to-pos-integer.js"(exports2, module2) {
    "use strict";
    var toInteger = require_to_integer();
    var max = Math.max;
    module2.exports = function(value) {
      return max(0, toInteger(value));
    };
  }
});

// ../node_modules/memoizee/lib/resolve-length.js
var require_resolve_length = __commonJS({
  "../node_modules/memoizee/lib/resolve-length.js"(exports2, module2) {
    "use strict";
    var toPosInt = require_to_pos_integer();
    module2.exports = function(optsLength, fnLength, isAsync2) {
      var length;
      if (isNaN(optsLength)) {
        length = fnLength;
        if (!(length >= 0)) return 1;
        if (isAsync2 && length) return length - 1;
        return length;
      }
      if (optsLength === false) return false;
      return toPosInt(optsLength);
    };
  }
});

// ../node_modules/es5-ext/object/valid-callable.js
var require_valid_callable = __commonJS({
  "../node_modules/es5-ext/object/valid-callable.js"(exports2, module2) {
    "use strict";
    module2.exports = function(fn) {
      if (typeof fn !== "function") throw new TypeError(fn + " is not a function");
      return fn;
    };
  }
});

// ../node_modules/es5-ext/object/valid-value.js
var require_valid_value = __commonJS({
  "../node_modules/es5-ext/object/valid-value.js"(exports2, module2) {
    "use strict";
    var isValue = require_is_value();
    module2.exports = function(value) {
      if (!isValue(value)) throw new TypeError("Cannot use null or undefined");
      return value;
    };
  }
});

// ../node_modules/es5-ext/object/_iterate.js
var require_iterate = __commonJS({
  "../node_modules/es5-ext/object/_iterate.js"(exports2, module2) {
    "use strict";
    var callable = require_valid_callable();
    var value = require_valid_value();
    var bind = Function.prototype.bind;
    var call = Function.prototype.call;
    var keys = Object.keys;
    var objPropertyIsEnumerable = Object.prototype.propertyIsEnumerable;
    module2.exports = function(method, defVal) {
      return function(obj, cb) {
        var list, thisArg = arguments[2], compareFn = arguments[3];
        obj = Object(value(obj));
        callable(cb);
        list = keys(obj);
        if (compareFn) {
          list.sort(typeof compareFn === "function" ? bind.call(compareFn, obj) : void 0);
        }
        if (typeof method !== "function") method = list[method];
        return call.call(method, list, function(key, index2) {
          if (!objPropertyIsEnumerable.call(obj, key)) return defVal;
          return call.call(cb, thisArg, obj[key], key, obj, index2);
        });
      };
    };
  }
});

// ../node_modules/es5-ext/object/for-each.js
var require_for_each = __commonJS({
  "../node_modules/es5-ext/object/for-each.js"(exports2, module2) {
    "use strict";
    module2.exports = require_iterate()("forEach");
  }
});

// ../node_modules/memoizee/lib/registered-extensions.js
var require_registered_extensions = __commonJS({
  "../node_modules/memoizee/lib/registered-extensions.js"() {
    "use strict";
  }
});

// ../node_modules/es5-ext/object/assign/is-implemented.js
var require_is_implemented2 = __commonJS({
  "../node_modules/es5-ext/object/assign/is-implemented.js"(exports2, module2) {
    "use strict";
    module2.exports = function() {
      var assign = Object.assign, obj;
      if (typeof assign !== "function") return false;
      obj = { foo: "raz" };
      assign(obj, { bar: "dwa" }, { trzy: "trzy" });
      return obj.foo + obj.bar + obj.trzy === "razdwatrzy";
    };
  }
});

// ../node_modules/es5-ext/object/keys/is-implemented.js
var require_is_implemented3 = __commonJS({
  "../node_modules/es5-ext/object/keys/is-implemented.js"(exports2, module2) {
    "use strict";
    module2.exports = function() {
      try {
        Object.keys("primitive");
        return true;
      } catch (e) {
        return false;
      }
    };
  }
});

// ../node_modules/es5-ext/object/keys/shim.js
var require_shim2 = __commonJS({
  "../node_modules/es5-ext/object/keys/shim.js"(exports2, module2) {
    "use strict";
    var isValue = require_is_value();
    var keys = Object.keys;
    module2.exports = function(object) {
      return keys(isValue(object) ? Object(object) : object);
    };
  }
});

// ../node_modules/es5-ext/object/keys/index.js
var require_keys = __commonJS({
  "../node_modules/es5-ext/object/keys/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_is_implemented3()() ? Object.keys : require_shim2();
  }
});

// ../node_modules/es5-ext/object/assign/shim.js
var require_shim3 = __commonJS({
  "../node_modules/es5-ext/object/assign/shim.js"(exports2, module2) {
    "use strict";
    var keys = require_keys();
    var value = require_valid_value();
    var max = Math.max;
    module2.exports = function(dest, src) {
      var error, i, length = max(arguments.length, 2), assign;
      dest = Object(value(dest));
      assign = function(key) {
        try {
          dest[key] = src[key];
        } catch (e) {
          if (!error) error = e;
        }
      };
      for (i = 1; i < length; ++i) {
        src = arguments[i];
        keys(src).forEach(assign);
      }
      if (error !== void 0) throw error;
      return dest;
    };
  }
});

// ../node_modules/es5-ext/object/assign/index.js
var require_assign = __commonJS({
  "../node_modules/es5-ext/object/assign/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_is_implemented2()() ? Object.assign : require_shim3();
  }
});

// ../node_modules/es5-ext/object/is-object.js
var require_is_object = __commonJS({
  "../node_modules/es5-ext/object/is-object.js"(exports2, module2) {
    "use strict";
    var isValue = require_is_value();
    var map = { function: true, object: true };
    module2.exports = function(value) {
      return isValue(value) && map[typeof value] || false;
    };
  }
});

// ../node_modules/es5-ext/error/custom.js
var require_custom = __commonJS({
  "../node_modules/es5-ext/error/custom.js"(exports2, module2) {
    "use strict";
    var assign = require_assign();
    var isObject = require_is_object();
    var isValue = require_is_value();
    var captureStackTrace = Error.captureStackTrace;
    module2.exports = function(message) {
      var err = new Error(message), code = arguments[1], ext = arguments[2];
      if (!isValue(ext)) {
        if (isObject(code)) {
          ext = code;
          code = null;
        }
      }
      if (isValue(ext)) assign(err, ext);
      if (isValue(code)) err.code = code;
      if (captureStackTrace) captureStackTrace(err, module2.exports);
      return err;
    };
  }
});

// ../node_modules/es5-ext/object/mixin.js
var require_mixin = __commonJS({
  "../node_modules/es5-ext/object/mixin.js"(exports2, module2) {
    "use strict";
    var value = require_valid_value();
    var defineProperty = Object.defineProperty;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var getOwnPropertyNames = Object.getOwnPropertyNames;
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    module2.exports = function(target, source) {
      var error, sourceObject = Object(value(source));
      target = Object(value(target));
      getOwnPropertyNames(sourceObject).forEach(function(name) {
        try {
          defineProperty(target, name, getOwnPropertyDescriptor(source, name));
        } catch (e) {
          error = e;
        }
      });
      if (typeof getOwnPropertySymbols === "function") {
        getOwnPropertySymbols(sourceObject).forEach(function(symbol) {
          try {
            defineProperty(target, symbol, getOwnPropertyDescriptor(source, symbol));
          } catch (e) {
            error = e;
          }
        });
      }
      if (error !== void 0) throw error;
      return target;
    };
  }
});

// ../node_modules/es5-ext/function/_define-length.js
var require_define_length = __commonJS({
  "../node_modules/es5-ext/function/_define-length.js"(exports2, module2) {
    "use strict";
    var toPosInt = require_to_pos_integer();
    var test = function(arg1, arg2) {
      return arg2;
    };
    var desc4;
    var defineProperty;
    var generate;
    var mixin;
    try {
      Object.defineProperty(test, "length", {
        configurable: true,
        writable: false,
        enumerable: false,
        value: 1
      });
    } catch (ignore) {
    }
    if (test.length === 1) {
      desc4 = { configurable: true, writable: false, enumerable: false };
      defineProperty = Object.defineProperty;
      module2.exports = function(fn, length) {
        length = toPosInt(length);
        if (fn.length === length) return fn;
        desc4.value = length;
        return defineProperty(fn, "length", desc4);
      };
    } else {
      mixin = require_mixin();
      generate = /* @__PURE__ */ (function() {
        var cache2 = [];
        return function(length) {
          var args, i = 0;
          if (cache2[length]) return cache2[length];
          args = [];
          while (length--) args.push("a" + (++i).toString(36));
          return new Function(
            "fn",
            "return function (" + args.join(", ") + ") { return fn.apply(this, arguments); };"
          );
        };
      })();
      module2.exports = function(src, length) {
        var target;
        length = toPosInt(length);
        if (src.length === length) return src;
        target = generate(length)(src);
        try {
          mixin(target, src);
        } catch (ignore) {
        }
        return target;
      };
    }
  }
});

// ../node_modules/type/value/is.js
var require_is = __commonJS({
  "../node_modules/type/value/is.js"(exports2, module2) {
    "use strict";
    var _undefined = void 0;
    module2.exports = function(value) {
      return value !== _undefined && value !== null;
    };
  }
});

// ../node_modules/type/object/is.js
var require_is2 = __commonJS({
  "../node_modules/type/object/is.js"(exports2, module2) {
    "use strict";
    var isValue = require_is();
    var possibleTypes = {
      "object": true,
      "function": true,
      "undefined": true
      /* document.all */
    };
    module2.exports = function(value) {
      if (!isValue(value)) return false;
      return hasOwnProperty.call(possibleTypes, typeof value);
    };
  }
});

// ../node_modules/type/prototype/is.js
var require_is3 = __commonJS({
  "../node_modules/type/prototype/is.js"(exports2, module2) {
    "use strict";
    var isObject = require_is2();
    module2.exports = function(value) {
      if (!isObject(value)) return false;
      try {
        if (!value.constructor) return false;
        return value.constructor.prototype === value;
      } catch (error) {
        return false;
      }
    };
  }
});

// ../node_modules/type/function/is.js
var require_is4 = __commonJS({
  "../node_modules/type/function/is.js"(exports2, module2) {
    "use strict";
    var isPrototype = require_is3();
    module2.exports = function(value) {
      if (typeof value !== "function") return false;
      if (!hasOwnProperty.call(value, "length")) return false;
      try {
        if (typeof value.length !== "number") return false;
        if (typeof value.call !== "function") return false;
        if (typeof value.apply !== "function") return false;
      } catch (error) {
        return false;
      }
      return !isPrototype(value);
    };
  }
});

// ../node_modules/type/plain-function/is.js
var require_is5 = __commonJS({
  "../node_modules/type/plain-function/is.js"(exports2, module2) {
    "use strict";
    var isFunction = require_is4();
    var classRe = /^\s*class[\s{/}]/;
    var functionToString = Function.prototype.toString;
    module2.exports = function(value) {
      if (!isFunction(value)) return false;
      if (classRe.test(functionToString.call(value))) return false;
      return true;
    };
  }
});

// ../node_modules/es5-ext/string/#/contains/is-implemented.js
var require_is_implemented4 = __commonJS({
  "../node_modules/es5-ext/string/#/contains/is-implemented.js"(exports2, module2) {
    "use strict";
    var str = "razdwatrzy";
    module2.exports = function() {
      if (typeof str.contains !== "function") return false;
      return str.contains("dwa") === true && str.contains("foo") === false;
    };
  }
});

// ../node_modules/es5-ext/string/#/contains/shim.js
var require_shim4 = __commonJS({
  "../node_modules/es5-ext/string/#/contains/shim.js"(exports2, module2) {
    "use strict";
    var indexOf = String.prototype.indexOf;
    module2.exports = function(searchString) {
      return indexOf.call(this, searchString, arguments[1]) > -1;
    };
  }
});

// ../node_modules/es5-ext/string/#/contains/index.js
var require_contains = __commonJS({
  "../node_modules/es5-ext/string/#/contains/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_is_implemented4()() ? String.prototype.contains : require_shim4();
  }
});

// ../node_modules/d/index.js
var require_d = __commonJS({
  "../node_modules/d/index.js"(exports2, module2) {
    "use strict";
    var isValue = require_is();
    var isPlainFunction = require_is5();
    var assign = require_assign();
    var normalizeOpts = require_normalize_options();
    var contains = require_contains();
    var d = module2.exports = function(dscr, value) {
      var c, e, w, options, desc4;
      if (arguments.length < 2 || typeof dscr !== "string") {
        options = value;
        value = dscr;
        dscr = null;
      } else {
        options = arguments[2];
      }
      if (isValue(dscr)) {
        c = contains.call(dscr, "c");
        e = contains.call(dscr, "e");
        w = contains.call(dscr, "w");
      } else {
        c = w = true;
        e = false;
      }
      desc4 = { value, configurable: c, enumerable: e, writable: w };
      return !options ? desc4 : assign(normalizeOpts(options), desc4);
    };
    d.gs = function(dscr, get, set) {
      var c, e, options, desc4;
      if (typeof dscr !== "string") {
        options = set;
        set = get;
        get = dscr;
        dscr = null;
      } else {
        options = arguments[3];
      }
      if (!isValue(get)) {
        get = void 0;
      } else if (!isPlainFunction(get)) {
        options = get;
        get = set = void 0;
      } else if (!isValue(set)) {
        set = void 0;
      } else if (!isPlainFunction(set)) {
        options = set;
        set = void 0;
      }
      if (isValue(dscr)) {
        c = contains.call(dscr, "c");
        e = contains.call(dscr, "e");
      } else {
        c = true;
        e = false;
      }
      desc4 = { get, set, configurable: c, enumerable: e };
      return !options ? desc4 : assign(normalizeOpts(options), desc4);
    };
  }
});

// ../node_modules/event-emitter/index.js
var require_event_emitter = __commonJS({
  "../node_modules/event-emitter/index.js"(exports2, module2) {
    "use strict";
    var d = require_d();
    var callable = require_valid_callable();
    var apply = Function.prototype.apply;
    var call = Function.prototype.call;
    var create = Object.create;
    var defineProperty = Object.defineProperty;
    var defineProperties = Object.defineProperties;
    var hasOwnProperty2 = Object.prototype.hasOwnProperty;
    var descriptor = { configurable: true, enumerable: false, writable: true };
    var on;
    var once;
    var off;
    var emit;
    var methods;
    var descriptors;
    var base;
    on = function(type, listener) {
      var data;
      callable(listener);
      if (!hasOwnProperty2.call(this, "__ee__")) {
        data = descriptor.value = create(null);
        defineProperty(this, "__ee__", descriptor);
        descriptor.value = null;
      } else {
        data = this.__ee__;
      }
      if (!data[type]) data[type] = listener;
      else if (typeof data[type] === "object") data[type].push(listener);
      else data[type] = [data[type], listener];
      return this;
    };
    once = function(type, listener) {
      var once2, self2;
      callable(listener);
      self2 = this;
      on.call(this, type, once2 = function() {
        off.call(self2, type, once2);
        apply.call(listener, this, arguments);
      });
      once2.__eeOnceListener__ = listener;
      return this;
    };
    off = function(type, listener) {
      var data, listeners, candidate, i;
      callable(listener);
      if (!hasOwnProperty2.call(this, "__ee__")) return this;
      data = this.__ee__;
      if (!data[type]) return this;
      listeners = data[type];
      if (typeof listeners === "object") {
        for (i = 0; candidate = listeners[i]; ++i) {
          if (candidate === listener || candidate.__eeOnceListener__ === listener) {
            if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
            else listeners.splice(i, 1);
          }
        }
      } else {
        if (listeners === listener || listeners.__eeOnceListener__ === listener) {
          delete data[type];
        }
      }
      return this;
    };
    emit = function(type) {
      var i, l, listener, listeners, args;
      if (!hasOwnProperty2.call(this, "__ee__")) return;
      listeners = this.__ee__[type];
      if (!listeners) return;
      if (typeof listeners === "object") {
        l = arguments.length;
        args = new Array(l - 1);
        for (i = 1; i < l; ++i) args[i - 1] = arguments[i];
        listeners = listeners.slice();
        for (i = 0; listener = listeners[i]; ++i) {
          apply.call(listener, this, args);
        }
      } else {
        switch (arguments.length) {
          case 1:
            call.call(listeners, this);
            break;
          case 2:
            call.call(listeners, this, arguments[1]);
            break;
          case 3:
            call.call(listeners, this, arguments[1], arguments[2]);
            break;
          default:
            l = arguments.length;
            args = new Array(l - 1);
            for (i = 1; i < l; ++i) {
              args[i - 1] = arguments[i];
            }
            apply.call(listeners, this, args);
        }
      }
    };
    methods = {
      on,
      once,
      off,
      emit
    };
    descriptors = {
      on: d(on),
      once: d(once),
      off: d(off),
      emit: d(emit)
    };
    base = defineProperties({}, descriptors);
    module2.exports = exports2 = function(o) {
      return o == null ? create(base) : defineProperties(Object(o), descriptors);
    };
    exports2.methods = methods;
  }
});

// ../node_modules/es5-ext/array/from/is-implemented.js
var require_is_implemented5 = __commonJS({
  "../node_modules/es5-ext/array/from/is-implemented.js"(exports2, module2) {
    "use strict";
    module2.exports = function() {
      var from = Array.from, arr, result;
      if (typeof from !== "function") return false;
      arr = ["raz", "dwa"];
      result = from(arr);
      return Boolean(result && result !== arr && result[1] === "dwa");
    };
  }
});

// ../node_modules/ext/global-this/is-implemented.js
var require_is_implemented6 = __commonJS({
  "../node_modules/ext/global-this/is-implemented.js"(exports2, module2) {
    "use strict";
    module2.exports = function() {
      if (typeof globalThis !== "object") return false;
      if (!globalThis) return false;
      return globalThis.Array === Array;
    };
  }
});

// ../node_modules/ext/global-this/implementation.js
var require_implementation = __commonJS({
  "../node_modules/ext/global-this/implementation.js"(exports2, module2) {
    var naiveFallback = function() {
      if (typeof self === "object" && self) return self;
      if (typeof window === "object" && window) return window;
      throw new Error("Unable to resolve global `this`");
    };
    module2.exports = (function() {
      if (this) return this;
      try {
        Object.defineProperty(Object.prototype, "__global__", {
          get: function() {
            return this;
          },
          configurable: true
        });
      } catch (error) {
        return naiveFallback();
      }
      try {
        if (!__global__) return naiveFallback();
        return __global__;
      } finally {
        delete Object.prototype.__global__;
      }
    })();
  }
});

// ../node_modules/ext/global-this/index.js
var require_global_this = __commonJS({
  "../node_modules/ext/global-this/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_is_implemented6()() ? globalThis : require_implementation();
  }
});

// ../node_modules/es6-symbol/is-implemented.js
var require_is_implemented7 = __commonJS({
  "../node_modules/es6-symbol/is-implemented.js"(exports2, module2) {
    "use strict";
    var global = require_global_this();
    var validTypes = { object: true, symbol: true };
    module2.exports = function() {
      var Symbol2 = global.Symbol;
      var symbol;
      if (typeof Symbol2 !== "function") return false;
      symbol = Symbol2("test symbol");
      try {
        String(symbol);
      } catch (e) {
        return false;
      }
      if (!validTypes[typeof Symbol2.iterator]) return false;
      if (!validTypes[typeof Symbol2.toPrimitive]) return false;
      if (!validTypes[typeof Symbol2.toStringTag]) return false;
      return true;
    };
  }
});

// ../node_modules/es6-symbol/is-symbol.js
var require_is_symbol = __commonJS({
  "../node_modules/es6-symbol/is-symbol.js"(exports2, module2) {
    "use strict";
    module2.exports = function(value) {
      if (!value) return false;
      if (typeof value === "symbol") return true;
      if (!value.constructor) return false;
      if (value.constructor.name !== "Symbol") return false;
      return value[value.constructor.toStringTag] === "Symbol";
    };
  }
});

// ../node_modules/es6-symbol/validate-symbol.js
var require_validate_symbol = __commonJS({
  "../node_modules/es6-symbol/validate-symbol.js"(exports2, module2) {
    "use strict";
    var isSymbol = require_is_symbol();
    module2.exports = function(value) {
      if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
      return value;
    };
  }
});

// ../node_modules/es6-symbol/lib/private/generate-name.js
var require_generate_name = __commonJS({
  "../node_modules/es6-symbol/lib/private/generate-name.js"(exports2, module2) {
    "use strict";
    var d = require_d();
    var create = Object.create;
    var defineProperty = Object.defineProperty;
    var objPrototype = Object.prototype;
    var created = create(null);
    module2.exports = function(desc4) {
      var postfix = 0, name, ie11BugWorkaround;
      while (created[desc4 + (postfix || "")]) ++postfix;
      desc4 += postfix || "";
      created[desc4] = true;
      name = "@@" + desc4;
      defineProperty(
        objPrototype,
        name,
        d.gs(null, function(value) {
          if (ie11BugWorkaround) return;
          ie11BugWorkaround = true;
          defineProperty(this, name, d(value));
          ie11BugWorkaround = false;
        })
      );
      return name;
    };
  }
});

// ../node_modules/es6-symbol/lib/private/setup/standard-symbols.js
var require_standard_symbols = __commonJS({
  "../node_modules/es6-symbol/lib/private/setup/standard-symbols.js"(exports2, module2) {
    "use strict";
    var d = require_d();
    var NativeSymbol = require_global_this().Symbol;
    module2.exports = function(SymbolPolyfill) {
      return Object.defineProperties(SymbolPolyfill, {
        // To ensure proper interoperability with other native functions (e.g. Array.from)
        // fallback to eventual native implementation of given symbol
        hasInstance: d(
          "",
          NativeSymbol && NativeSymbol.hasInstance || SymbolPolyfill("hasInstance")
        ),
        isConcatSpreadable: d(
          "",
          NativeSymbol && NativeSymbol.isConcatSpreadable || SymbolPolyfill("isConcatSpreadable")
        ),
        iterator: d("", NativeSymbol && NativeSymbol.iterator || SymbolPolyfill("iterator")),
        match: d("", NativeSymbol && NativeSymbol.match || SymbolPolyfill("match")),
        replace: d("", NativeSymbol && NativeSymbol.replace || SymbolPolyfill("replace")),
        search: d("", NativeSymbol && NativeSymbol.search || SymbolPolyfill("search")),
        species: d("", NativeSymbol && NativeSymbol.species || SymbolPolyfill("species")),
        split: d("", NativeSymbol && NativeSymbol.split || SymbolPolyfill("split")),
        toPrimitive: d(
          "",
          NativeSymbol && NativeSymbol.toPrimitive || SymbolPolyfill("toPrimitive")
        ),
        toStringTag: d(
          "",
          NativeSymbol && NativeSymbol.toStringTag || SymbolPolyfill("toStringTag")
        ),
        unscopables: d(
          "",
          NativeSymbol && NativeSymbol.unscopables || SymbolPolyfill("unscopables")
        )
      });
    };
  }
});

// ../node_modules/es6-symbol/lib/private/setup/symbol-registry.js
var require_symbol_registry = __commonJS({
  "../node_modules/es6-symbol/lib/private/setup/symbol-registry.js"(exports2, module2) {
    "use strict";
    var d = require_d();
    var validateSymbol = require_validate_symbol();
    var registry = /* @__PURE__ */ Object.create(null);
    module2.exports = function(SymbolPolyfill) {
      return Object.defineProperties(SymbolPolyfill, {
        for: d(function(key) {
          if (registry[key]) return registry[key];
          return registry[key] = SymbolPolyfill(String(key));
        }),
        keyFor: d(function(symbol) {
          var key;
          validateSymbol(symbol);
          for (key in registry) {
            if (registry[key] === symbol) return key;
          }
          return void 0;
        })
      });
    };
  }
});

// ../node_modules/es6-symbol/polyfill.js
var require_polyfill = __commonJS({
  "../node_modules/es6-symbol/polyfill.js"(exports2, module2) {
    "use strict";
    var d = require_d();
    var validateSymbol = require_validate_symbol();
    var NativeSymbol = require_global_this().Symbol;
    var generateName = require_generate_name();
    var setupStandardSymbols = require_standard_symbols();
    var setupSymbolRegistry = require_symbol_registry();
    var create = Object.create;
    var defineProperties = Object.defineProperties;
    var defineProperty = Object.defineProperty;
    var SymbolPolyfill;
    var HiddenSymbol;
    var isNativeSafe;
    if (typeof NativeSymbol === "function") {
      try {
        String(NativeSymbol());
        isNativeSafe = true;
      } catch (ignore) {
      }
    } else {
      NativeSymbol = null;
    }
    HiddenSymbol = function Symbol2(description) {
      if (this instanceof HiddenSymbol) throw new TypeError("Symbol is not a constructor");
      return SymbolPolyfill(description);
    };
    module2.exports = SymbolPolyfill = function Symbol2(description) {
      var symbol;
      if (this instanceof Symbol2) throw new TypeError("Symbol is not a constructor");
      if (isNativeSafe) return NativeSymbol(description);
      symbol = create(HiddenSymbol.prototype);
      description = description === void 0 ? "" : String(description);
      return defineProperties(symbol, {
        __description__: d("", description),
        __name__: d("", generateName(description))
      });
    };
    setupStandardSymbols(SymbolPolyfill);
    setupSymbolRegistry(SymbolPolyfill);
    defineProperties(HiddenSymbol.prototype, {
      constructor: d(SymbolPolyfill),
      toString: d("", function() {
        return this.__name__;
      })
    });
    defineProperties(SymbolPolyfill.prototype, {
      toString: d(function() {
        return "Symbol (" + validateSymbol(this).__description__ + ")";
      }),
      valueOf: d(function() {
        return validateSymbol(this);
      })
    });
    defineProperty(
      SymbolPolyfill.prototype,
      SymbolPolyfill.toPrimitive,
      d("", function() {
        var symbol = validateSymbol(this);
        if (typeof symbol === "symbol") return symbol;
        return symbol.toString();
      })
    );
    defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d("c", "Symbol"));
    defineProperty(
      HiddenSymbol.prototype,
      SymbolPolyfill.toStringTag,
      d("c", SymbolPolyfill.prototype[SymbolPolyfill.toStringTag])
    );
    defineProperty(
      HiddenSymbol.prototype,
      SymbolPolyfill.toPrimitive,
      d("c", SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive])
    );
  }
});

// ../node_modules/es6-symbol/index.js
var require_es6_symbol = __commonJS({
  "../node_modules/es6-symbol/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_is_implemented7()() ? require_global_this().Symbol : require_polyfill();
  }
});

// ../node_modules/es5-ext/function/is-arguments.js
var require_is_arguments = __commonJS({
  "../node_modules/es5-ext/function/is-arguments.js"(exports2, module2) {
    "use strict";
    var objToString = Object.prototype.toString;
    var id = objToString.call(/* @__PURE__ */ (function() {
      return arguments;
    })());
    module2.exports = function(value) {
      return objToString.call(value) === id;
    };
  }
});

// ../node_modules/es5-ext/function/is-function.js
var require_is_function = __commonJS({
  "../node_modules/es5-ext/function/is-function.js"(exports2, module2) {
    "use strict";
    var objToString = Object.prototype.toString;
    var isFunctionStringTag = RegExp.prototype.test.bind(/^[object [A-Za-z0-9]*Function]$/);
    module2.exports = function(value) {
      return typeof value === "function" && isFunctionStringTag(objToString.call(value));
    };
  }
});

// ../node_modules/es5-ext/string/is-string.js
var require_is_string = __commonJS({
  "../node_modules/es5-ext/string/is-string.js"(exports2, module2) {
    "use strict";
    var objToString = Object.prototype.toString;
    var id = objToString.call("");
    module2.exports = function(value) {
      return typeof value === "string" || value && typeof value === "object" && (value instanceof String || objToString.call(value) === id) || false;
    };
  }
});

// ../node_modules/es5-ext/array/from/shim.js
var require_shim5 = __commonJS({
  "../node_modules/es5-ext/array/from/shim.js"(exports2, module2) {
    "use strict";
    var iteratorSymbol = require_es6_symbol().iterator;
    var isArguments = require_is_arguments();
    var isFunction = require_is_function();
    var toPosInt = require_to_pos_integer();
    var callable = require_valid_callable();
    var validValue = require_valid_value();
    var isValue = require_is_value();
    var isString = require_is_string();
    var isArray = Array.isArray;
    var call = Function.prototype.call;
    var desc4 = { configurable: true, enumerable: true, writable: true, value: null };
    var defineProperty = Object.defineProperty;
    module2.exports = function(arrayLike) {
      var mapFn = arguments[1], thisArg = arguments[2], Context, i, j, arr, length, code, iterator, result, getIterator, value;
      arrayLike = Object(validValue(arrayLike));
      if (isValue(mapFn)) callable(mapFn);
      if (!this || this === Array || !isFunction(this)) {
        if (!mapFn) {
          if (isArguments(arrayLike)) {
            length = arrayLike.length;
            if (length !== 1) return Array.apply(null, arrayLike);
            arr = new Array(1);
            arr[0] = arrayLike[0];
            return arr;
          }
          if (isArray(arrayLike)) {
            arr = new Array(length = arrayLike.length);
            for (i = 0; i < length; ++i) arr[i] = arrayLike[i];
            return arr;
          }
        }
        arr = [];
      } else {
        Context = this;
      }
      if (!isArray(arrayLike)) {
        if ((getIterator = arrayLike[iteratorSymbol]) !== void 0) {
          iterator = callable(getIterator).call(arrayLike);
          if (Context) arr = new Context();
          result = iterator.next();
          i = 0;
          while (!result.done) {
            value = mapFn ? call.call(mapFn, thisArg, result.value, i) : result.value;
            if (Context) {
              desc4.value = value;
              defineProperty(arr, i, desc4);
            } else {
              arr[i] = value;
            }
            result = iterator.next();
            ++i;
          }
          length = i;
        } else if (isString(arrayLike)) {
          length = arrayLike.length;
          if (Context) arr = new Context();
          for (i = 0, j = 0; i < length; ++i) {
            value = arrayLike[i];
            if (i + 1 < length) {
              code = value.charCodeAt(0);
              if (code >= 55296 && code <= 56319) value += arrayLike[++i];
            }
            value = mapFn ? call.call(mapFn, thisArg, value, j) : value;
            if (Context) {
              desc4.value = value;
              defineProperty(arr, j, desc4);
            } else {
              arr[j] = value;
            }
            ++j;
          }
          length = j;
        }
      }
      if (length === void 0) {
        length = toPosInt(arrayLike.length);
        if (Context) arr = new Context(length);
        for (i = 0; i < length; ++i) {
          value = mapFn ? call.call(mapFn, thisArg, arrayLike[i], i) : arrayLike[i];
          if (Context) {
            desc4.value = value;
            defineProperty(arr, i, desc4);
          } else {
            arr[i] = value;
          }
        }
      }
      if (Context) {
        desc4.value = null;
        arr.length = length;
      }
      return arr;
    };
  }
});

// ../node_modules/es5-ext/array/from/index.js
var require_from = __commonJS({
  "../node_modules/es5-ext/array/from/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_is_implemented5()() ? Array.from : require_shim5();
  }
});

// ../node_modules/es5-ext/array/to-array.js
var require_to_array = __commonJS({
  "../node_modules/es5-ext/array/to-array.js"(exports2, module2) {
    "use strict";
    var from = require_from();
    var isArray = Array.isArray;
    module2.exports = function(arrayLike) {
      return isArray(arrayLike) ? arrayLike : from(arrayLike);
    };
  }
});

// ../node_modules/memoizee/lib/resolve-resolve.js
var require_resolve_resolve = __commonJS({
  "../node_modules/memoizee/lib/resolve-resolve.js"(exports2, module2) {
    "use strict";
    var toArray = require_to_array();
    var isValue = require_is_value();
    var callable = require_valid_callable();
    var slice = Array.prototype.slice;
    var resolveArgs;
    resolveArgs = function(args) {
      return this.map(function(resolve, i) {
        return resolve ? resolve(args[i]) : args[i];
      }).concat(
        slice.call(args, this.length)
      );
    };
    module2.exports = function(resolvers) {
      resolvers = toArray(resolvers);
      resolvers.forEach(function(resolve) {
        if (isValue(resolve)) callable(resolve);
      });
      return resolveArgs.bind(resolvers);
    };
  }
});

// ../node_modules/memoizee/lib/resolve-normalize.js
var require_resolve_normalize = __commonJS({
  "../node_modules/memoizee/lib/resolve-normalize.js"(exports2, module2) {
    "use strict";
    var callable = require_valid_callable();
    module2.exports = function(userNormalizer) {
      var normalizer;
      if (typeof userNormalizer === "function") return { set: userNormalizer, get: userNormalizer };
      normalizer = { get: callable(userNormalizer.get) };
      if (userNormalizer.set !== void 0) {
        normalizer.set = callable(userNormalizer.set);
        if (userNormalizer.delete) normalizer.delete = callable(userNormalizer.delete);
        if (userNormalizer.clear) normalizer.clear = callable(userNormalizer.clear);
        return normalizer;
      }
      normalizer.set = normalizer.get;
      return normalizer;
    };
  }
});

// ../node_modules/memoizee/lib/configure-map.js
var require_configure_map = __commonJS({
  "../node_modules/memoizee/lib/configure-map.js"(exports2, module2) {
    "use strict";
    var customError = require_custom();
    var defineLength = require_define_length();
    var d = require_d();
    var ee = require_event_emitter().methods;
    var resolveResolve = require_resolve_resolve();
    var resolveNormalize = require_resolve_normalize();
    var apply = Function.prototype.apply;
    var call = Function.prototype.call;
    var create = Object.create;
    var defineProperties = Object.defineProperties;
    var on = ee.on;
    var emit = ee.emit;
    module2.exports = function(original, length, options) {
      var cache2 = create(null), conf, memLength, get, set, del, clear, extDel, extGet, extHas, normalizer, getListeners, setListeners, deleteListeners, memoized, resolve;
      if (length !== false) memLength = length;
      else if (isNaN(original.length)) memLength = 1;
      else memLength = original.length;
      if (options.normalizer) {
        normalizer = resolveNormalize(options.normalizer);
        get = normalizer.get;
        set = normalizer.set;
        del = normalizer.delete;
        clear = normalizer.clear;
      }
      if (options.resolvers != null) resolve = resolveResolve(options.resolvers);
      if (get) {
        memoized = defineLength(function(arg) {
          var id, result, args = arguments;
          if (resolve) args = resolve(args);
          id = get(args);
          if (id !== null) {
            if (hasOwnProperty.call(cache2, id)) {
              if (getListeners) conf.emit("get", id, args, this);
              return cache2[id];
            }
          }
          if (args.length === 1) result = call.call(original, this, args[0]);
          else result = apply.call(original, this, args);
          if (id === null) {
            id = get(args);
            if (id !== null) throw customError("Circular invocation", "CIRCULAR_INVOCATION");
            id = set(args);
          } else if (hasOwnProperty.call(cache2, id)) {
            throw customError("Circular invocation", "CIRCULAR_INVOCATION");
          }
          cache2[id] = result;
          if (setListeners) conf.emit("set", id, null, result);
          return result;
        }, memLength);
      } else if (length === 0) {
        memoized = function() {
          var result;
          if (hasOwnProperty.call(cache2, "data")) {
            if (getListeners) conf.emit("get", "data", arguments, this);
            return cache2.data;
          }
          if (arguments.length) result = apply.call(original, this, arguments);
          else result = call.call(original, this);
          if (hasOwnProperty.call(cache2, "data")) {
            throw customError("Circular invocation", "CIRCULAR_INVOCATION");
          }
          cache2.data = result;
          if (setListeners) conf.emit("set", "data", null, result);
          return result;
        };
      } else {
        memoized = function(arg) {
          var result, args = arguments, id;
          if (resolve) args = resolve(arguments);
          id = String(args[0]);
          if (hasOwnProperty.call(cache2, id)) {
            if (getListeners) conf.emit("get", id, args, this);
            return cache2[id];
          }
          if (args.length === 1) result = call.call(original, this, args[0]);
          else result = apply.call(original, this, args);
          if (hasOwnProperty.call(cache2, id)) {
            throw customError("Circular invocation", "CIRCULAR_INVOCATION");
          }
          cache2[id] = result;
          if (setListeners) conf.emit("set", id, null, result);
          return result;
        };
      }
      conf = {
        original,
        memoized,
        profileName: options.profileName,
        get: function(args) {
          if (resolve) args = resolve(args);
          if (get) return get(args);
          return String(args[0]);
        },
        has: function(id) {
          return hasOwnProperty.call(cache2, id);
        },
        delete: function(id) {
          var result;
          if (!hasOwnProperty.call(cache2, id)) return;
          if (del) del(id);
          result = cache2[id];
          delete cache2[id];
          if (deleteListeners) conf.emit("delete", id, result);
        },
        clear: function() {
          var oldCache = cache2;
          if (clear) clear();
          cache2 = create(null);
          conf.emit("clear", oldCache);
        },
        on: function(type, listener) {
          if (type === "get") getListeners = true;
          else if (type === "set") setListeners = true;
          else if (type === "delete") deleteListeners = true;
          return on.call(this, type, listener);
        },
        emit,
        updateEnv: function() {
          original = conf.original;
        }
      };
      if (get) {
        extDel = defineLength(function(arg) {
          var id, args = arguments;
          if (resolve) args = resolve(args);
          id = get(args);
          if (id === null) return;
          conf.delete(id);
        }, memLength);
      } else if (length === 0) {
        extDel = function() {
          return conf.delete("data");
        };
      } else {
        extDel = function(arg) {
          if (resolve) arg = resolve(arguments)[0];
          return conf.delete(arg);
        };
      }
      extGet = defineLength(function() {
        var id, args = arguments;
        if (length === 0) return cache2.data;
        if (resolve) args = resolve(args);
        if (get) id = get(args);
        else id = String(args[0]);
        return cache2[id];
      });
      extHas = defineLength(function() {
        var id, args = arguments;
        if (length === 0) return conf.has("data");
        if (resolve) args = resolve(args);
        if (get) id = get(args);
        else id = String(args[0]);
        if (id === null) return false;
        return conf.has(id);
      });
      defineProperties(memoized, {
        __memoized__: d(true),
        delete: d(extDel),
        clear: d(conf.clear),
        _get: d(extGet),
        _has: d(extHas)
      });
      return conf;
    };
  }
});

// ../node_modules/memoizee/plain.js
var require_plain = __commonJS({
  "../node_modules/memoizee/plain.js"(exports2, module2) {
    "use strict";
    var callable = require_valid_callable();
    var forEach = require_for_each();
    var extensions = require_registered_extensions();
    var configure = require_configure_map();
    var resolveLength = require_resolve_length();
    module2.exports = function self2(fn) {
      var options, length, conf;
      callable(fn);
      options = Object(arguments[1]);
      if (options.async && options.promise) {
        throw new Error("Options 'async' and 'promise' cannot be used together");
      }
      if (hasOwnProperty.call(fn, "__memoized__") && !options.force) return fn;
      length = resolveLength(options.length, fn.length, options.async && extensions.async);
      conf = configure(fn, length, options);
      forEach(extensions, function(extFn, name) {
        if (options[name]) extFn(options[name], conf, options);
      });
      if (self2.__profiler__) self2.__profiler__(conf);
      conf.updateEnv();
      return conf.memoized;
    };
  }
});

// ../node_modules/memoizee/normalizers/primitive.js
var require_primitive = __commonJS({
  "../node_modules/memoizee/normalizers/primitive.js"(exports2, module2) {
    "use strict";
    module2.exports = function(args) {
      var id, i, length = args.length;
      if (!length) return "";
      id = String(args[i = 0]);
      while (--length) id += "" + args[++i];
      return id;
    };
  }
});

// ../node_modules/memoizee/normalizers/get-primitive-fixed.js
var require_get_primitive_fixed = __commonJS({
  "../node_modules/memoizee/normalizers/get-primitive-fixed.js"(exports2, module2) {
    "use strict";
    module2.exports = function(length) {
      if (!length) {
        return function() {
          return "";
        };
      }
      return function(args) {
        var id = String(args[0]), i = 0, currentLength = length;
        while (--currentLength) {
          id += "" + args[++i];
        }
        return id;
      };
    };
  }
});

// ../node_modules/es5-ext/number/is-nan/is-implemented.js
var require_is_implemented8 = __commonJS({
  "../node_modules/es5-ext/number/is-nan/is-implemented.js"(exports2, module2) {
    "use strict";
    module2.exports = function() {
      var numberIsNaN = Number.isNaN;
      if (typeof numberIsNaN !== "function") return false;
      return !numberIsNaN({}) && numberIsNaN(NaN) && !numberIsNaN(34);
    };
  }
});

// ../node_modules/es5-ext/number/is-nan/shim.js
var require_shim6 = __commonJS({
  "../node_modules/es5-ext/number/is-nan/shim.js"(exports2, module2) {
    "use strict";
    module2.exports = function(value) {
      return value !== value;
    };
  }
});

// ../node_modules/es5-ext/number/is-nan/index.js
var require_is_nan = __commonJS({
  "../node_modules/es5-ext/number/is-nan/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_is_implemented8()() ? Number.isNaN : require_shim6();
  }
});

// ../node_modules/es5-ext/array/#/e-index-of.js
var require_e_index_of = __commonJS({
  "../node_modules/es5-ext/array/#/e-index-of.js"(exports2, module2) {
    "use strict";
    var numberIsNaN = require_is_nan();
    var toPosInt = require_to_pos_integer();
    var value = require_valid_value();
    var indexOf = Array.prototype.indexOf;
    var objHasOwnProperty = Object.prototype.hasOwnProperty;
    var abs = Math.abs;
    var floor = Math.floor;
    module2.exports = function(searchElement) {
      var i, length, fromIndex, val;
      if (!numberIsNaN(searchElement)) return indexOf.apply(this, arguments);
      length = toPosInt(value(this).length);
      fromIndex = arguments[1];
      if (isNaN(fromIndex)) fromIndex = 0;
      else if (fromIndex >= 0) fromIndex = floor(fromIndex);
      else fromIndex = toPosInt(this.length) - floor(abs(fromIndex));
      for (i = fromIndex; i < length; ++i) {
        if (objHasOwnProperty.call(this, i)) {
          val = this[i];
          if (numberIsNaN(val)) return i;
        }
      }
      return -1;
    };
  }
});

// ../node_modules/memoizee/normalizers/get.js
var require_get = __commonJS({
  "../node_modules/memoizee/normalizers/get.js"(exports2, module2) {
    "use strict";
    var indexOf = require_e_index_of();
    var create = Object.create;
    module2.exports = function() {
      var lastId = 0, map = [], cache2 = create(null);
      return {
        get: function(args) {
          var index2 = 0, set = map, i, length = args.length;
          if (length === 0) return set[length] || null;
          if (set = set[length]) {
            while (index2 < length - 1) {
              i = indexOf.call(set[0], args[index2]);
              if (i === -1) return null;
              set = set[1][i];
              ++index2;
            }
            i = indexOf.call(set[0], args[index2]);
            if (i === -1) return null;
            return set[1][i] || null;
          }
          return null;
        },
        set: function(args) {
          var index2 = 0, set = map, i, length = args.length;
          if (length === 0) {
            set[length] = ++lastId;
          } else {
            if (!set[length]) {
              set[length] = [[], []];
            }
            set = set[length];
            while (index2 < length - 1) {
              i = indexOf.call(set[0], args[index2]);
              if (i === -1) {
                i = set[0].push(args[index2]) - 1;
                set[1].push([[], []]);
              }
              set = set[1][i];
              ++index2;
            }
            i = indexOf.call(set[0], args[index2]);
            if (i === -1) {
              i = set[0].push(args[index2]) - 1;
            }
            set[1][i] = ++lastId;
          }
          cache2[lastId] = args;
          return lastId;
        },
        delete: function(id) {
          var index2 = 0, set = map, i, args = cache2[id], length = args.length, path2 = [];
          if (length === 0) {
            delete set[length];
          } else if (set = set[length]) {
            while (index2 < length - 1) {
              i = indexOf.call(set[0], args[index2]);
              if (i === -1) {
                return;
              }
              path2.push(set, i);
              set = set[1][i];
              ++index2;
            }
            i = indexOf.call(set[0], args[index2]);
            if (i === -1) {
              return;
            }
            id = set[1][i];
            set[0].splice(i, 1);
            set[1].splice(i, 1);
            while (!set[0].length && path2.length) {
              i = path2.pop();
              set = path2.pop();
              set[0].splice(i, 1);
              set[1].splice(i, 1);
            }
          }
          delete cache2[id];
        },
        clear: function() {
          map = [];
          cache2 = create(null);
        }
      };
    };
  }
});

// ../node_modules/memoizee/normalizers/get-1.js
var require_get_1 = __commonJS({
  "../node_modules/memoizee/normalizers/get-1.js"(exports2, module2) {
    "use strict";
    var indexOf = require_e_index_of();
    module2.exports = function() {
      var lastId = 0, argsMap = [], cache2 = [];
      return {
        get: function(args) {
          var index2 = indexOf.call(argsMap, args[0]);
          return index2 === -1 ? null : cache2[index2];
        },
        set: function(args) {
          argsMap.push(args[0]);
          cache2.push(++lastId);
          return lastId;
        },
        delete: function(id) {
          var index2 = indexOf.call(cache2, id);
          if (index2 !== -1) {
            argsMap.splice(index2, 1);
            cache2.splice(index2, 1);
          }
        },
        clear: function() {
          argsMap = [];
          cache2 = [];
        }
      };
    };
  }
});

// ../node_modules/memoizee/normalizers/get-fixed.js
var require_get_fixed = __commonJS({
  "../node_modules/memoizee/normalizers/get-fixed.js"(exports2, module2) {
    "use strict";
    var indexOf = require_e_index_of();
    var create = Object.create;
    module2.exports = function(length) {
      var lastId = 0, map = [[], []], cache2 = create(null);
      return {
        get: function(args) {
          var index2 = 0, set = map, i;
          while (index2 < length - 1) {
            i = indexOf.call(set[0], args[index2]);
            if (i === -1) return null;
            set = set[1][i];
            ++index2;
          }
          i = indexOf.call(set[0], args[index2]);
          if (i === -1) return null;
          return set[1][i] || null;
        },
        set: function(args) {
          var index2 = 0, set = map, i;
          while (index2 < length - 1) {
            i = indexOf.call(set[0], args[index2]);
            if (i === -1) {
              i = set[0].push(args[index2]) - 1;
              set[1].push([[], []]);
            }
            set = set[1][i];
            ++index2;
          }
          i = indexOf.call(set[0], args[index2]);
          if (i === -1) {
            i = set[0].push(args[index2]) - 1;
          }
          set[1][i] = ++lastId;
          cache2[lastId] = args;
          return lastId;
        },
        delete: function(id) {
          var index2 = 0, set = map, i, path2 = [], args = cache2[id];
          while (index2 < length - 1) {
            i = indexOf.call(set[0], args[index2]);
            if (i === -1) {
              return;
            }
            path2.push(set, i);
            set = set[1][i];
            ++index2;
          }
          i = indexOf.call(set[0], args[index2]);
          if (i === -1) {
            return;
          }
          id = set[1][i];
          set[0].splice(i, 1);
          set[1].splice(i, 1);
          while (!set[0].length && path2.length) {
            i = path2.pop();
            set = path2.pop();
            set[0].splice(i, 1);
            set[1].splice(i, 1);
          }
          delete cache2[id];
        },
        clear: function() {
          map = [[], []];
          cache2 = create(null);
        }
      };
    };
  }
});

// ../node_modules/es5-ext/object/map.js
var require_map = __commonJS({
  "../node_modules/es5-ext/object/map.js"(exports2, module2) {
    "use strict";
    var callable = require_valid_callable();
    var forEach = require_for_each();
    var call = Function.prototype.call;
    module2.exports = function(obj, cb) {
      var result = {}, thisArg = arguments[2];
      callable(cb);
      forEach(obj, function(value, key, targetObj, index2) {
        result[key] = call.call(cb, thisArg, value, key, targetObj, index2);
      });
      return result;
    };
  }
});

// ../node_modules/next-tick/index.js
var require_next_tick = __commonJS({
  "../node_modules/next-tick/index.js"(exports2, module2) {
    "use strict";
    var ensureCallable = function(fn) {
      if (typeof fn !== "function") throw new TypeError(fn + " is not a function");
      return fn;
    };
    var byObserver = function(Observer) {
      var node = document.createTextNode(""), queue, currentQueue, i = 0;
      new Observer(function() {
        var callback;
        if (!queue) {
          if (!currentQueue) return;
          queue = currentQueue;
        } else if (currentQueue) {
          queue = currentQueue.concat(queue);
        }
        currentQueue = queue;
        queue = null;
        if (typeof currentQueue === "function") {
          callback = currentQueue;
          currentQueue = null;
          callback();
          return;
        }
        node.data = i = ++i % 2;
        while (currentQueue) {
          callback = currentQueue.shift();
          if (!currentQueue.length) currentQueue = null;
          callback();
        }
      }).observe(node, { characterData: true });
      return function(fn) {
        ensureCallable(fn);
        if (queue) {
          if (typeof queue === "function") queue = [queue, fn];
          else queue.push(fn);
          return;
        }
        queue = fn;
        node.data = i = ++i % 2;
      };
    };
    module2.exports = (function() {
      if (typeof process === "object" && process && typeof process.nextTick === "function") {
        return process.nextTick;
      }
      if (typeof queueMicrotask === "function") {
        return function(cb) {
          queueMicrotask(ensureCallable(cb));
        };
      }
      if (typeof document === "object" && document) {
        if (typeof MutationObserver === "function") return byObserver(MutationObserver);
        if (typeof WebKitMutationObserver === "function") return byObserver(WebKitMutationObserver);
      }
      if (typeof setImmediate === "function") {
        return function(cb) {
          setImmediate(ensureCallable(cb));
        };
      }
      if (typeof setTimeout === "function" || typeof setTimeout === "object") {
        return function(cb) {
          setTimeout(ensureCallable(cb), 0);
        };
      }
      return null;
    })();
  }
});

// ../node_modules/memoizee/ext/async.js
var require_async = __commonJS({
  "../node_modules/memoizee/ext/async.js"() {
    "use strict";
    var aFrom = require_from();
    var objectMap = require_map();
    var mixin = require_mixin();
    var defineLength = require_define_length();
    var nextTick = require_next_tick();
    var slice = Array.prototype.slice;
    var apply = Function.prototype.apply;
    var create = Object.create;
    require_registered_extensions().async = function(tbi, conf) {
      var waiting = create(null), cache2 = create(null), base = conf.memoized, original = conf.original, currentCallback, currentContext, currentArgs;
      conf.memoized = defineLength(function(arg) {
        var args = arguments, last = args[args.length - 1];
        if (typeof last === "function") {
          currentCallback = last;
          args = slice.call(args, 0, -1);
        }
        return base.apply(currentContext = this, currentArgs = args);
      }, base);
      try {
        mixin(conf.memoized, base);
      } catch (ignore) {
      }
      conf.on("get", function(id) {
        var cb, context, args;
        if (!currentCallback) return;
        if (waiting[id]) {
          if (typeof waiting[id] === "function") waiting[id] = [waiting[id], currentCallback];
          else waiting[id].push(currentCallback);
          currentCallback = null;
          return;
        }
        cb = currentCallback;
        context = currentContext;
        args = currentArgs;
        currentCallback = currentContext = currentArgs = null;
        nextTick(function() {
          var data;
          if (hasOwnProperty.call(cache2, id)) {
            data = cache2[id];
            conf.emit("getasync", id, args, context);
            apply.call(cb, data.context, data.args);
          } else {
            currentCallback = cb;
            currentContext = context;
            currentArgs = args;
            base.apply(context, args);
          }
        });
      });
      conf.original = function() {
        var args, cb, origCb, result;
        if (!currentCallback) return apply.call(original, this, arguments);
        args = aFrom(arguments);
        cb = function self2(err) {
          var cb2, args2, id = self2.id;
          if (id == null) {
            nextTick(apply.bind(self2, this, arguments));
            return void 0;
          }
          delete self2.id;
          cb2 = waiting[id];
          delete waiting[id];
          if (!cb2) {
            return void 0;
          }
          args2 = aFrom(arguments);
          if (conf.has(id)) {
            if (err) {
              conf.delete(id);
            } else {
              cache2[id] = { context: this, args: args2 };
              conf.emit("setasync", id, typeof cb2 === "function" ? 1 : cb2.length);
            }
          }
          if (typeof cb2 === "function") {
            result = apply.call(cb2, this, args2);
          } else {
            cb2.forEach(function(cb3) {
              result = apply.call(cb3, this, args2);
            }, this);
          }
          return result;
        };
        origCb = currentCallback;
        currentCallback = currentContext = currentArgs = null;
        args.push(cb);
        result = apply.call(original, this, args);
        cb.cb = origCb;
        currentCallback = cb;
        return result;
      };
      conf.on("set", function(id) {
        if (!currentCallback) {
          conf.delete(id);
          return;
        }
        if (waiting[id]) {
          if (typeof waiting[id] === "function") waiting[id] = [waiting[id], currentCallback.cb];
          else waiting[id].push(currentCallback.cb);
        } else {
          waiting[id] = currentCallback.cb;
        }
        delete currentCallback.cb;
        currentCallback.id = id;
        currentCallback = null;
      });
      conf.on("delete", function(id) {
        var result;
        if (hasOwnProperty.call(waiting, id)) return;
        if (!cache2[id]) return;
        result = cache2[id];
        delete cache2[id];
        conf.emit("deleteasync", id, slice.call(result.args, 1));
      });
      conf.on("clear", function() {
        var oldCache = cache2;
        cache2 = create(null);
        conf.emit(
          "clearasync",
          objectMap(oldCache, function(data) {
            return slice.call(data.args, 1);
          })
        );
      });
    };
  }
});

// ../node_modules/es5-ext/object/primitive-set.js
var require_primitive_set = __commonJS({
  "../node_modules/es5-ext/object/primitive-set.js"(exports2, module2) {
    "use strict";
    var forEach = Array.prototype.forEach;
    var create = Object.create;
    module2.exports = function(arg) {
      var set = create(null);
      forEach.call(arguments, function(name) {
        set[name] = true;
      });
      return set;
    };
  }
});

// ../node_modules/es5-ext/object/is-callable.js
var require_is_callable = __commonJS({
  "../node_modules/es5-ext/object/is-callable.js"(exports2, module2) {
    "use strict";
    module2.exports = function(obj) {
      return typeof obj === "function";
    };
  }
});

// ../node_modules/es5-ext/object/validate-stringifiable.js
var require_validate_stringifiable = __commonJS({
  "../node_modules/es5-ext/object/validate-stringifiable.js"(exports2, module2) {
    "use strict";
    var isCallable = require_is_callable();
    module2.exports = function(stringifiable) {
      try {
        if (stringifiable && isCallable(stringifiable.toString)) return stringifiable.toString();
        return String(stringifiable);
      } catch (e) {
        throw new TypeError("Passed argument cannot be stringifed");
      }
    };
  }
});

// ../node_modules/es5-ext/object/validate-stringifiable-value.js
var require_validate_stringifiable_value = __commonJS({
  "../node_modules/es5-ext/object/validate-stringifiable-value.js"(exports2, module2) {
    "use strict";
    var ensureValue = require_valid_value();
    var stringifiable = require_validate_stringifiable();
    module2.exports = function(value) {
      return stringifiable(ensureValue(value));
    };
  }
});

// ../node_modules/es5-ext/safe-to-string.js
var require_safe_to_string = __commonJS({
  "../node_modules/es5-ext/safe-to-string.js"(exports2, module2) {
    "use strict";
    var isCallable = require_is_callable();
    module2.exports = function(value) {
      try {
        if (value && isCallable(value.toString)) return value.toString();
        return String(value);
      } catch (e) {
        return "<Non-coercible to string value>";
      }
    };
  }
});

// ../node_modules/es5-ext/to-short-string-representation.js
var require_to_short_string_representation = __commonJS({
  "../node_modules/es5-ext/to-short-string-representation.js"(exports2, module2) {
    "use strict";
    var safeToString = require_safe_to_string();
    var reNewLine = /[\n\r\u2028\u2029]/g;
    module2.exports = function(value) {
      var string = safeToString(value);
      if (string.length > 100) string = string.slice(0, 99) + "\u2026";
      string = string.replace(reNewLine, function(char) {
        return JSON.stringify(char).slice(1, -1);
      });
      return string;
    };
  }
});

// ../node_modules/is-promise/index.js
var require_is_promise = __commonJS({
  "../node_modules/is-promise/index.js"(exports2, module2) {
    module2.exports = isPromise;
    module2.exports.default = isPromise;
    function isPromise(obj) {
      return !!obj && (typeof obj === "object" || typeof obj === "function") && typeof obj.then === "function";
    }
  }
});

// ../node_modules/memoizee/ext/promise.js
var require_promise = __commonJS({
  "../node_modules/memoizee/ext/promise.js"() {
    "use strict";
    var objectMap = require_map();
    var primitiveSet = require_primitive_set();
    var ensureString = require_validate_stringifiable_value();
    var toShortString = require_to_short_string_representation();
    var isPromise = require_is_promise();
    var nextTick = require_next_tick();
    var create = Object.create;
    var supportedModes = primitiveSet("then", "then:finally", "done", "done:finally");
    require_registered_extensions().promise = function(mode, conf) {
      var waiting = create(null), cache2 = create(null), promises = create(null);
      if (mode === true) {
        mode = null;
      } else {
        mode = ensureString(mode);
        if (!supportedModes[mode]) {
          throw new TypeError("'" + toShortString(mode) + "' is not valid promise mode");
        }
      }
      conf.on("set", function(id, ignore, promise) {
        var isFailed = false;
        if (!isPromise(promise)) {
          cache2[id] = promise;
          conf.emit("setasync", id, 1);
          return;
        }
        waiting[id] = 1;
        promises[id] = promise;
        var onSuccess = function(result) {
          var count = waiting[id];
          if (isFailed) {
            throw new Error(
              "Memoizee error: Detected unordered then|done & finally resolution, which in turn makes proper detection of success/failure impossible (when in 'done:finally' mode)\nConsider to rely on 'then' or 'done' mode instead."
            );
          }
          if (!count) return;
          delete waiting[id];
          cache2[id] = result;
          conf.emit("setasync", id, count);
        };
        var onFailure = function() {
          isFailed = true;
          if (!waiting[id]) return;
          delete waiting[id];
          delete promises[id];
          conf.delete(id);
        };
        var resolvedMode = mode;
        if (!resolvedMode) resolvedMode = "then";
        if (resolvedMode === "then") {
          var nextTickFailure = function() {
            nextTick(onFailure);
          };
          promise = promise.then(function(result) {
            nextTick(onSuccess.bind(this, result));
          }, nextTickFailure);
          if (typeof promise.finally === "function") {
            promise.finally(nextTickFailure);
          }
        } else if (resolvedMode === "done") {
          if (typeof promise.done !== "function") {
            throw new Error(
              "Memoizee error: Retrieved promise does not implement 'done' in 'done' mode"
            );
          }
          promise.done(onSuccess, onFailure);
        } else if (resolvedMode === "done:finally") {
          if (typeof promise.done !== "function") {
            throw new Error(
              "Memoizee error: Retrieved promise does not implement 'done' in 'done:finally' mode"
            );
          }
          if (typeof promise.finally !== "function") {
            throw new Error(
              "Memoizee error: Retrieved promise does not implement 'finally' in 'done:finally' mode"
            );
          }
          promise.done(onSuccess);
          promise.finally(onFailure);
        }
      });
      conf.on("get", function(id, args, context) {
        var promise;
        if (waiting[id]) {
          ++waiting[id];
          return;
        }
        promise = promises[id];
        var emit = function() {
          conf.emit("getasync", id, args, context);
        };
        if (isPromise(promise)) {
          if (typeof promise.done === "function") promise.done(emit);
          else {
            promise.then(function() {
              nextTick(emit);
            });
          }
        } else {
          emit();
        }
      });
      conf.on("delete", function(id) {
        delete promises[id];
        if (waiting[id]) {
          delete waiting[id];
          return;
        }
        if (!hasOwnProperty.call(cache2, id)) return;
        var result = cache2[id];
        delete cache2[id];
        conf.emit("deleteasync", id, [result]);
      });
      conf.on("clear", function() {
        var oldCache = cache2;
        cache2 = create(null);
        waiting = create(null);
        promises = create(null);
        conf.emit("clearasync", objectMap(oldCache, function(data) {
          return [data];
        }));
      });
    };
  }
});

// ../node_modules/memoizee/ext/dispose.js
var require_dispose = __commonJS({
  "../node_modules/memoizee/ext/dispose.js"() {
    "use strict";
    var callable = require_valid_callable();
    var forEach = require_for_each();
    var extensions = require_registered_extensions();
    var apply = Function.prototype.apply;
    extensions.dispose = function(dispose, conf, options) {
      var del;
      callable(dispose);
      if (options.async && extensions.async || options.promise && extensions.promise) {
        conf.on(
          "deleteasync",
          del = function(id, resultArray) {
            apply.call(dispose, null, resultArray);
          }
        );
        conf.on("clearasync", function(cache2) {
          forEach(cache2, function(result, id) {
            del(id, result);
          });
        });
        return;
      }
      conf.on("delete", del = function(id, result) {
        dispose(result);
      });
      conf.on("clear", function(cache2) {
        forEach(cache2, function(result, id) {
          del(id, result);
        });
      });
    };
  }
});

// ../node_modules/timers-ext/max-timeout.js
var require_max_timeout = __commonJS({
  "../node_modules/timers-ext/max-timeout.js"(exports2, module2) {
    "use strict";
    module2.exports = 2147483647;
  }
});

// ../node_modules/timers-ext/valid-timeout.js
var require_valid_timeout = __commonJS({
  "../node_modules/timers-ext/valid-timeout.js"(exports2, module2) {
    "use strict";
    var toPosInt = require_to_pos_integer();
    var maxTimeout = require_max_timeout();
    module2.exports = function(value) {
      value = toPosInt(value);
      if (value > maxTimeout) throw new TypeError(value + " exceeds maximum possible timeout");
      return value;
    };
  }
});

// ../node_modules/memoizee/ext/max-age.js
var require_max_age = __commonJS({
  "../node_modules/memoizee/ext/max-age.js"() {
    "use strict";
    var aFrom = require_from();
    var forEach = require_for_each();
    var nextTick = require_next_tick();
    var isPromise = require_is_promise();
    var timeout = require_valid_timeout();
    var extensions = require_registered_extensions();
    var noop = Function.prototype;
    var max = Math.max;
    var min = Math.min;
    var create = Object.create;
    extensions.maxAge = function(maxAge, conf, options) {
      var timeouts, postfix, preFetchAge, preFetchTimeouts;
      maxAge = timeout(maxAge);
      if (!maxAge) return;
      timeouts = create(null);
      postfix = options.async && extensions.async || options.promise && extensions.promise ? "async" : "";
      conf.on("set" + postfix, function(id) {
        timeouts[id] = setTimeout(function() {
          conf.delete(id);
        }, maxAge);
        if (typeof timeouts[id].unref === "function") timeouts[id].unref();
        if (!preFetchTimeouts) return;
        if (preFetchTimeouts[id]) {
          if (preFetchTimeouts[id] !== "nextTick") clearTimeout(preFetchTimeouts[id]);
        }
        preFetchTimeouts[id] = setTimeout(function() {
          delete preFetchTimeouts[id];
        }, preFetchAge);
        if (typeof preFetchTimeouts[id].unref === "function") preFetchTimeouts[id].unref();
      });
      conf.on("delete" + postfix, function(id) {
        clearTimeout(timeouts[id]);
        delete timeouts[id];
        if (!preFetchTimeouts) return;
        if (preFetchTimeouts[id] !== "nextTick") clearTimeout(preFetchTimeouts[id]);
        delete preFetchTimeouts[id];
      });
      if (options.preFetch) {
        if (options.preFetch === true || isNaN(options.preFetch)) {
          preFetchAge = 0.333;
        } else {
          preFetchAge = max(min(Number(options.preFetch), 1), 0);
        }
        if (preFetchAge) {
          preFetchTimeouts = {};
          preFetchAge = (1 - preFetchAge) * maxAge;
          conf.on("get" + postfix, function(id, args, context) {
            if (!preFetchTimeouts[id]) {
              preFetchTimeouts[id] = "nextTick";
              nextTick(function() {
                var result;
                if (preFetchTimeouts[id] !== "nextTick") return;
                delete preFetchTimeouts[id];
                conf.delete(id);
                if (options.async) {
                  args = aFrom(args);
                  args.push(noop);
                }
                result = conf.memoized.apply(context, args);
                if (options.promise) {
                  if (isPromise(result)) {
                    if (typeof result.done === "function") result.done(noop, noop);
                    else result.then(noop, noop);
                  }
                }
              });
            }
          });
        }
      }
      conf.on("clear" + postfix, function() {
        forEach(timeouts, function(id) {
          clearTimeout(id);
        });
        timeouts = {};
        if (preFetchTimeouts) {
          forEach(preFetchTimeouts, function(id) {
            if (id !== "nextTick") clearTimeout(id);
          });
          preFetchTimeouts = {};
        }
      });
    };
  }
});

// ../node_modules/lru-queue/index.js
var require_lru_queue = __commonJS({
  "../node_modules/lru-queue/index.js"(exports2, module2) {
    "use strict";
    var toPosInt = require_to_pos_integer();
    var create = Object.create;
    var hasOwnProperty2 = Object.prototype.hasOwnProperty;
    module2.exports = function(limit) {
      var size = 0, base = 1, queue = create(null), map = create(null), index2 = 0, del;
      limit = toPosInt(limit);
      return {
        hit: function(id) {
          var oldIndex = map[id], nuIndex = ++index2;
          queue[nuIndex] = id;
          map[id] = nuIndex;
          if (!oldIndex) {
            ++size;
            if (size <= limit) return;
            id = queue[base];
            del(id);
            return id;
          }
          delete queue[oldIndex];
          if (base !== oldIndex) return;
          while (!hasOwnProperty2.call(queue, ++base)) continue;
        },
        delete: del = function(id) {
          var oldIndex = map[id];
          if (!oldIndex) return;
          delete queue[oldIndex];
          delete map[id];
          --size;
          if (base !== oldIndex) return;
          if (!size) {
            index2 = 0;
            base = 1;
            return;
          }
          while (!hasOwnProperty2.call(queue, ++base)) continue;
        },
        clear: function() {
          size = 0;
          base = 1;
          queue = create(null);
          map = create(null);
          index2 = 0;
        }
      };
    };
  }
});

// ../node_modules/memoizee/ext/max.js
var require_max = __commonJS({
  "../node_modules/memoizee/ext/max.js"() {
    "use strict";
    var toPosInteger = require_to_pos_integer();
    var lruQueue = require_lru_queue();
    var extensions = require_registered_extensions();
    extensions.max = function(max, conf, options) {
      var postfix, queue, hit;
      max = toPosInteger(max);
      if (!max) return;
      queue = lruQueue(max);
      postfix = options.async && extensions.async || options.promise && extensions.promise ? "async" : "";
      conf.on(
        "set" + postfix,
        hit = function(id) {
          id = queue.hit(id);
          if (id === void 0) return;
          conf.delete(id);
        }
      );
      conf.on("get" + postfix, hit);
      conf.on("delete" + postfix, queue.delete);
      conf.on("clear" + postfix, queue.clear);
    };
  }
});

// ../node_modules/memoizee/ext/ref-counter.js
var require_ref_counter = __commonJS({
  "../node_modules/memoizee/ext/ref-counter.js"() {
    "use strict";
    var d = require_d();
    var extensions = require_registered_extensions();
    var create = Object.create;
    var defineProperties = Object.defineProperties;
    extensions.refCounter = function(ignore, conf, options) {
      var cache2, postfix;
      cache2 = create(null);
      postfix = options.async && extensions.async || options.promise && extensions.promise ? "async" : "";
      conf.on("set" + postfix, function(id, length) {
        cache2[id] = length || 1;
      });
      conf.on("get" + postfix, function(id) {
        ++cache2[id];
      });
      conf.on("delete" + postfix, function(id) {
        delete cache2[id];
      });
      conf.on("clear" + postfix, function() {
        cache2 = {};
      });
      defineProperties(conf.memoized, {
        deleteRef: d(function() {
          var id = conf.get(arguments);
          if (id === null) return null;
          if (!cache2[id]) return null;
          if (!--cache2[id]) {
            conf.delete(id);
            return true;
          }
          return false;
        }),
        getRefCount: d(function() {
          var id = conf.get(arguments);
          if (id === null) return 0;
          if (!cache2[id]) return 0;
          return cache2[id];
        })
      });
    };
  }
});

// ../node_modules/memoizee/index.js
var require_memoizee = __commonJS({
  "../node_modules/memoizee/index.js"(exports2, module2) {
    "use strict";
    var normalizeOpts = require_normalize_options();
    var resolveLength = require_resolve_length();
    var plain = require_plain();
    module2.exports = function(fn) {
      var options = normalizeOpts(arguments[1]), length;
      if (!options.normalizer) {
        length = options.length = resolveLength(options.length, fn.length, options.async);
        if (length !== 0) {
          if (options.primitive) {
            if (length === false) {
              options.normalizer = require_primitive();
            } else if (length > 1) {
              options.normalizer = require_get_primitive_fixed()(length);
            }
          } else if (length === false) options.normalizer = require_get()();
          else if (length === 1) options.normalizer = require_get_1()();
          else options.normalizer = require_get_fixed()(length);
        }
      }
      if (options.async) require_async();
      if (options.promise) require_promise();
      if (options.dispose) require_dispose();
      if (options.maxAge) require_max_age();
      if (options.max) require_max();
      if (options.refCounter) require_ref_counter();
      return plain(fn, options);
    };
  }
});

// server/services/marketplace.ts
var marketplace_exports = {};
__export(marketplace_exports, {
  PRICE_RANGES: () => PRICE_RANGES,
  RATE_LIMITS: () => RATE_LIMITS,
  SITE_FEE_RATE: () => SITE_FEE_RATE2,
  buyCard: () => buyCard,
  calculateFee: () => calculateFee,
  cancelListing: () => cancelListing,
  checkBuySwapRateLimit: () => checkBuySwapRateLimit,
  checkSellRateLimit: () => checkSellRateLimit,
  listCardForSale: () => listCardForSale,
  recordMarketplaceTrade: () => recordMarketplaceTrade,
  recordTrade: () => recordTrade,
  validatePrice: () => validatePrice
});
function validatePrice(price, rarity) {
  const range = PRICE_RANGES[rarity];
  return price >= range.min && price <= range.max;
}
function calculateFee(price) {
  return Math.round(price * SITE_FEE_RATE2 * 100) / 100;
}
async function checkSellRateLimit(userId) {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
  const sellCount = await db.select({ count: import_drizzle_orm6.sql`count(*)` }).from(userTradeHistory).where(
    (0, import_drizzle_orm6.and)(
      (0, import_drizzle_orm6.eq)(userTradeHistory.userId, userId),
      (0, import_drizzle_orm6.eq)(userTradeHistory.tradeType, "sell"),
      (0, import_drizzle_orm6.gte)(userTradeHistory.createdAt, twentyFourHoursAgo)
    )
  );
  const count = Number(sellCount[0]?.count || 0);
  return count < RATE_LIMITS.SELL;
}
async function checkBuySwapRateLimit(userId) {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
  const tradeCount = await db.select({ count: import_drizzle_orm6.sql`count(*)` }).from(userTradeHistory).where(
    (0, import_drizzle_orm6.and)(
      (0, import_drizzle_orm6.eq)(userTradeHistory.userId, userId),
      import_drizzle_orm6.sql`${userTradeHistory.tradeType} IN ('buy', 'swap')`,
      (0, import_drizzle_orm6.gte)(userTradeHistory.createdAt, twentyFourHoursAgo)
    )
  );
  const count = Number(tradeCount[0]?.count || 0);
  return count < RATE_LIMITS.BUY_SWAP;
}
async function recordTrade(userId, tradeType, cardId, amount) {
  await db.insert(userTradeHistory).values({
    userId,
    tradeType,
    cardId,
    amount
  });
}
async function recordMarketplaceTrade(sellerId, buyerId, cardId, price, fee) {
  await db.insert(marketplaceTrades).values({
    sellerId,
    buyerId,
    cardId,
    price,
    fee,
    totalAmount: price + fee
  });
}
async function listCardForSale(userId, cardId, price) {
  const canSell = await checkSellRateLimit(userId);
  if (!canSell) {
    return { success: false, message: "Sell rate limit exceeded (5 per 24h)" };
  }
  const [card] = await db.select().from(playerCards).where((0, import_drizzle_orm6.eq)(playerCards.id, cardId)).limit(1);
  if (!card) {
    return { success: false, message: "Card not found" };
  }
  if (card.ownerId !== userId) {
    return { success: false, message: "You don't own this card" };
  }
  if (card.forSale) {
    return { success: false, message: "Card is already listed" };
  }
  if (!validatePrice(price, card.rarity)) {
    const range = PRICE_RANGES[card.rarity];
    return {
      success: false,
      message: `Price must be between ${range.min} and ${range.max} for ${card.rarity} cards`
    };
  }
  await db.update(playerCards).set({ forSale: true, price }).where((0, import_drizzle_orm6.eq)(playerCards.id, cardId));
  await recordTrade(userId, "sell", cardId, price);
  return { success: true };
}
async function buyCard(buyerId, cardId) {
  const canBuy = await checkBuySwapRateLimit(buyerId);
  if (!canBuy) {
    return { success: false, message: "Buy/swap rate limit exceeded (10 per 24h)" };
  }
  const [card] = await db.select().from(playerCards).where((0, import_drizzle_orm6.eq)(playerCards.id, cardId)).limit(1);
  if (!card) {
    return { success: false, message: "Card not found" };
  }
  if (!card.forSale) {
    return { success: false, message: "Card is not for sale" };
  }
  if (card.ownerId === buyerId) {
    return { success: false, message: "You cannot buy your own card" };
  }
  const sellerId = card.ownerId;
  const price = card.price || 0;
  const fee = calculateFee(price);
  const totalCost = price + fee;
  const [buyerWallet] = await db.select().from(wallets).where((0, import_drizzle_orm6.eq)(wallets.userId, buyerId)).limit(1);
  if (!buyerWallet || buyerWallet.balance < totalCost) {
    return { success: false, message: "Insufficient balance" };
  }
  await db.transaction(async (tx) => {
    await tx.update(playerCards).set({ ownerId: buyerId, forSale: false, price: 0 }).where((0, import_drizzle_orm6.eq)(playerCards.id, cardId));
    await tx.update(wallets).set({ balance: import_drizzle_orm6.sql`${wallets.balance} - ${totalCost}` }).where((0, import_drizzle_orm6.eq)(wallets.userId, buyerId));
    await tx.update(wallets).set({ balance: import_drizzle_orm6.sql`${wallets.balance} + ${price}` }).where((0, import_drizzle_orm6.eq)(wallets.userId, sellerId));
    await recordTrade(buyerId, "buy", cardId, totalCost);
    await recordMarketplaceTrade(sellerId, buyerId, cardId, price, fee);
  });
  return { success: true, totalCost };
}
async function cancelListing(userId, cardId) {
  const [card] = await db.select().from(playerCards).where((0, import_drizzle_orm6.eq)(playerCards.id, cardId)).limit(1);
  if (!card) {
    return { success: false, message: "Card not found" };
  }
  if (card.ownerId !== userId) {
    return { success: false, message: "You don't own this card" };
  }
  if (!card.forSale) {
    return { success: false, message: "Card is not listed" };
  }
  await db.update(playerCards).set({ forSale: false, price: 0 }).where((0, import_drizzle_orm6.eq)(playerCards.id, cardId));
  return { success: true };
}
var import_drizzle_orm6, SITE_FEE_RATE2, PRICE_RANGES, RATE_LIMITS;
var init_marketplace = __esm({
  "server/services/marketplace.ts"() {
    "use strict";
    init_db();
    init_schema();
    import_drizzle_orm6 = require("drizzle-orm");
    SITE_FEE_RATE2 = 0.08;
    PRICE_RANGES = {
      common: { min: 1, max: 10 },
      rare: { min: 11, max: 50 },
      unique: { min: 51, max: 200 },
      epic: { min: 201, max: 1e3 },
      legendary: { min: 1001, max: 5e3 }
    };
    RATE_LIMITS = {
      SELL: 5,
      BUY_SWAP: 10
    };
  }
});

// server/services/competitions.ts
var competitions_exports = {};
__export(competitions_exports, {
  calculateLineupScore: () => calculateLineupScore,
  checkCompetitionAccess: () => checkCompetitionAccess,
  getCompetitionLeaderboard: () => getCompetitionLeaderboard,
  settleCompetition: () => settleCompetition,
  validateLineup: () => validateLineup
});
async function validateLineup(cardIds) {
  if (cardIds.length !== 5) {
    return { valid: false, message: "Lineup must have exactly 5 cards" };
  }
  const cards = await db.select({
    id: playerCards.id,
    position: players.position
  }).from(playerCards).innerJoin(players, (0, import_drizzle_orm7.eq)(playerCards.playerId, players.id)).where(import_drizzle_orm7.sql`${playerCards.id} IN ${cardIds}`);
  if (cards.length !== 5) {
    return { valid: false, message: "Some cards not found" };
  }
  const positions = cards.map((c) => c.position);
  const positionCounts = {
    GK: positions.filter((p) => p === "GK").length,
    DEF: positions.filter((p) => p === "DEF").length,
    MID: positions.filter((p) => p === "MID").length,
    FWD: positions.filter((p) => p === "FWD").length
  };
  if (positionCounts.GK < 1) {
    return { valid: false, message: "Must have at least 1 GK" };
  }
  if (positionCounts.DEF < 1) {
    return { valid: false, message: "Must have at least 1 DEF" };
  }
  if (positionCounts.MID < 1) {
    return { valid: false, message: "Must have at least 1 MID" };
  }
  if (positionCounts.FWD < 1) {
    return { valid: false, message: "Must have at least 1 FWD" };
  }
  return { valid: true };
}
async function calculateLineupScore(cardIds) {
  const cards = await db.select({
    decisiveScore: playerCards.decisiveScore
  }).from(playerCards).where(import_drizzle_orm7.sql`${playerCards.id} IN ${cardIds}`);
  return cards.reduce((total, card) => total + (card.decisiveScore || 0), 0);
}
async function settleCompetition(competitionId) {
  const [competition] = await db.select().from(competitions).where((0, import_drizzle_orm7.eq)(competitions.id, competitionId)).limit(1);
  if (!competition) {
    return { success: false, message: "Competition not found" };
  }
  if (competition.status === "completed") {
    return { success: false, message: "Competition already settled" };
  }
  const entries = await db.select().from(competitionEntries).where((0, import_drizzle_orm7.eq)(competitionEntries.competitionId, competitionId));
  if (entries.length === 0) {
    return { success: false, message: "No entries to settle" };
  }
  const scoredEntries = await Promise.all(
    entries.map(async (entry) => {
      const score = await calculateLineupScore(entry.lineupCardIds);
      return { ...entry, calculatedScore: score };
    })
  );
  scoredEntries.sort((a, b) => b.calculatedScore - a.calculatedScore);
  const totalPrizePool = competition.entryFee * entries.length;
  const firstPrize = Math.round(totalPrizePool * 0.6 * 100) / 100;
  const secondPrize = Math.round(totalPrizePool * 0.3 * 100) / 100;
  const thirdPrize = Math.round(totalPrizePool * 0.1 * 100) / 100;
  await db.transaction(async (tx) => {
    await tx.update(competitions).set({ status: "completed" }).where((0, import_drizzle_orm7.eq)(competitions.id, competitionId));
    for (let i = 0; i < scoredEntries.length; i++) {
      const entry = scoredEntries[i];
      const rank = i + 1;
      let prizeAmount = 0;
      if (rank === 1) prizeAmount = firstPrize;
      else if (rank === 2) prizeAmount = secondPrize;
      else if (rank === 3) prizeAmount = thirdPrize;
      await tx.update(competitionEntries).set({
        totalScore: entry.calculatedScore,
        rank,
        prizeAmount
      }).where((0, import_drizzle_orm7.eq)(competitionEntries.id, entry.id));
      if (prizeAmount > 0) {
        await tx.update(wallets).set({ balance: import_drizzle_orm7.sql`${wallets.balance} + ${prizeAmount}` }).where((0, import_drizzle_orm7.eq)(wallets.userId, entry.userId));
        await tx.insert(transactions).values({
          userId: entry.userId,
          type: "prize",
          amount: prizeAmount,
          description: `Competition prize - Rank ${rank}`
        });
        await tx.insert(notifications).values({
          userId: entry.userId,
          type: "prize",
          title: `\u{1F3C6} Competition Prize!`,
          message: `Congratulations! You placed ${rank}${getRankSuffix(rank)} and won ${prizeAmount} credits!`,
          amount: prizeAmount,
          isRead: false
        });
      }
    }
  });
  return { success: true };
}
function getRankSuffix(rank) {
  if (rank === 1) return "st";
  if (rank === 2) return "nd";
  if (rank === 3) return "rd";
  return "th";
}
async function checkCompetitionAccess(userId, tier) {
  const userCards = await db.select().from(playerCards).where((0, import_drizzle_orm7.eq)(playerCards.ownerId, userId));
  if (tier === "rare") {
    const hasRareOrBetter = userCards.some(
      (card) => ["rare", "unique", "epic", "legendary"].includes(card.rarity)
    );
    if (!hasRareOrBetter) {
      return {
        canAccess: false,
        message: "You need at least one rare card to enter this competition"
      };
    }
  }
  return { canAccess: true };
}
async function getCompetitionLeaderboard(competitionId) {
  return await db.select({
    rank: competitionEntries.rank,
    userId: competitionEntries.userId,
    totalScore: competitionEntries.totalScore,
    prizeAmount: competitionEntries.prizeAmount
  }).from(competitionEntries).where((0, import_drizzle_orm7.eq)(competitionEntries.competitionId, competitionId)).orderBy((0, import_drizzle_orm7.desc)(competitionEntries.totalScore));
}
var import_drizzle_orm7;
var init_competitions = __esm({
  "server/services/competitions.ts"() {
    "use strict";
    init_db();
    init_schema();
    import_drizzle_orm7 = require("drizzle-orm");
  }
});

// server/services/fantasyLeagueApi.ts
var fantasyLeagueApi_exports = {};
__export(fantasyLeagueApi_exports, {
  clearCache: () => clearCache,
  getInjuries: () => getInjuries,
  getLeagueStandings: () => getLeagueStandings,
  getPlayerScores: () => getPlayerScores
});
function getCached(key, ttl) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  return null;
}
function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}
async function getLeagueStandings() {
  const cacheKey = "standings";
  const cached = getCached(cacheKey, CACHE_TTL.standings);
  if (cached) return cached;
  try {
    const standings = await db.select().from(eplStandings).orderBy((0, import_drizzle_orm8.desc)(eplStandings.rank));
    if (standings.length > 0) {
      const data = standings.map((team) => ({
        rank: team.rank,
        team: team.teamName,
        teamLogo: team.teamLogo,
        played: team.played,
        won: team.won,
        drawn: team.drawn,
        lost: team.lost,
        points: team.points,
        goalsFor: team.goalsFor,
        goalsAgainst: team.goalsAgainst,
        goalDiff: team.goalDiff,
        form: team.form
      }));
      setCache(cacheKey, data);
      return data;
    }
    return getMockStandings();
  } catch (error) {
    console.error("Error fetching standings:", error);
    return getMockStandings();
  }
}
async function getPlayerScores(limit = 20) {
  const cacheKey = `scores_${limit}`;
  const cached = getCached(cacheKey, CACHE_TTL.scores);
  if (cached) return cached;
  try {
    const players2 = await db.select({
      id: eplPlayers.id,
      name: eplPlayers.name,
      team: eplPlayers.team,
      position: eplPlayers.position,
      goals: eplPlayers.goals,
      assists: eplPlayers.assists,
      appearances: eplPlayers.appearances,
      rating: eplPlayers.rating,
      photo: eplPlayers.photo
    }).from(eplPlayers).orderBy((0, import_drizzle_orm8.desc)(eplPlayers.goals)).limit(limit);
    if (players2.length > 0) {
      const data = players2.map((player) => ({
        id: player.id,
        name: player.name,
        team: player.team,
        position: player.position,
        goals: player.goals || 0,
        assists: player.assists || 0,
        appearances: player.appearances || 0,
        rating: player.rating ? parseFloat(player.rating) : 0,
        photo: player.photo,
        fantasyPoints: calculateFantasyPoints(player)
      }));
      setCache(cacheKey, data);
      return data;
    }
    return getMockPlayerScores();
  } catch (error) {
    console.error("Error fetching player scores:", error);
    return getMockPlayerScores();
  }
}
async function getInjuries() {
  const cacheKey = "injuries";
  const cached = getCached(cacheKey, CACHE_TTL.injuries);
  if (cached) return cached;
  try {
    const injuries = await db.select().from(eplInjuries).orderBy((0, import_drizzle_orm8.desc)(eplInjuries.lastUpdated)).limit(50);
    if (injuries.length > 0) {
      const data = injuries.map((injury) => ({
        playerName: injury.playerName,
        playerPhoto: injury.playerPhoto,
        team: injury.team,
        teamLogo: injury.teamLogo,
        type: injury.type,
        reason: injury.reason,
        fixtureDate: injury.fixtureDate
      }));
      setCache(cacheKey, data);
      return data;
    }
    return getMockInjuries();
  } catch (error) {
    console.error("Error fetching injuries:", error);
    return getMockInjuries();
  }
}
function calculateFantasyPoints(player) {
  const goals = player.goals || 0;
  const assists = player.assists || 0;
  const appearances = player.appearances || 0;
  return goals * 10 + assists * 7 + appearances * 2;
}
function getMockStandings() {
  return [
    { rank: 1, team: "Arsenal", played: 25, won: 18, drawn: 5, lost: 2, points: 59, goalsFor: 55, goalsAgainst: 20, goalDiff: 35, form: "WWDWW" },
    { rank: 2, team: "Liverpool", played: 25, won: 17, drawn: 6, lost: 2, points: 57, goalsFor: 58, goalsAgainst: 25, goalDiff: 33, form: "DWWWD" },
    { rank: 3, team: "Manchester City", played: 25, won: 16, drawn: 7, lost: 2, points: 55, goalsFor: 52, goalsAgainst: 22, goalDiff: 30, form: "WDWDW" },
    { rank: 4, team: "Aston Villa", played: 25, won: 15, drawn: 5, lost: 5, points: 50, goalsFor: 48, goalsAgainst: 30, goalDiff: 18, form: "WWLWD" },
    { rank: 5, team: "Tottenham", played: 25, won: 14, drawn: 4, lost: 7, points: 46, goalsFor: 50, goalsAgainst: 35, goalDiff: 15, form: "WLWLW" }
  ];
}
function getMockPlayerScores() {
  return [
    { id: 1, name: "Erling Haaland", team: "Manchester City", position: "FWD", goals: 18, assists: 5, appearances: 23, rating: 8.2, fantasyPoints: 221 },
    { id: 2, name: "Mohamed Salah", team: "Liverpool", position: "FWD", goals: 15, assists: 10, appearances: 24, rating: 8, fantasyPoints: 268 },
    { id: 3, name: "Ollie Watkins", team: "Aston Villa", position: "FWD", goals: 14, assists: 8, appearances: 25, rating: 7.8, fantasyPoints: 246 },
    { id: 4, name: "Cole Palmer", team: "Chelsea", position: "MID", goals: 13, assists: 6, appearances: 24, rating: 7.9, fantasyPoints: 220 },
    { id: 5, name: "Bukayo Saka", team: "Arsenal", position: "MID", goals: 11, assists: 9, appearances: 25, rating: 7.7, fantasyPoints: 223 }
  ];
}
function getMockInjuries() {
  return [
    { playerName: "Gabriel Jesus", team: "Arsenal", type: "Knee Injury", reason: "Injury", fixtureDate: /* @__PURE__ */ new Date() },
    { playerName: "Dominic Calvert-Lewin", team: "Everton", type: "Hamstring", reason: "Injury", fixtureDate: /* @__PURE__ */ new Date() },
    { playerName: "Kalvin Phillips", team: "Manchester City", type: "Suspension", reason: "Yellow Cards", fixtureDate: /* @__PURE__ */ new Date() }
  ];
}
function clearCache() {
  cache.clear();
}
var import_drizzle_orm8, CACHE_TTL, cache;
var init_fantasyLeagueApi = __esm({
  "server/services/fantasyLeagueApi.ts"() {
    "use strict";
    init_db();
    init_schema();
    import_drizzle_orm8 = require("drizzle-orm");
    CACHE_TTL = {
      standings: 30 * 60 * 1e3,
      // 30 minutes
      injuries: 30 * 60 * 1e3,
      // 30 minutes
      scores: 5 * 60 * 1e3
      // 5 minutes
    };
    cache = /* @__PURE__ */ new Map();
  }
});

// server/index.ts
var index_exports = {};
__export(index_exports, {
  log: () => log
});
module.exports = __toCommonJS(index_exports);
var import_express2 = __toESM(require("express"));

// server/storage.ts
init_schema();
init_db();
var import_drizzle_orm4 = require("drizzle-orm");
var DatabaseStorage = class {
  async getUser(userId) {
    const [user] = await db.select().from(users).where((0, import_drizzle_orm4.eq)(users.id, userId));
    return user || void 0;
  }
  async getPlayers() {
    return db.select().from(players);
  }
  async getPlayer(id) {
    const [player] = await db.select().from(players).where((0, import_drizzle_orm4.eq)(players.id, id));
    return player || void 0;
  }
  async createPlayer(player) {
    const [created] = await db.insert(players).values(player).returning();
    return created;
  }
  async getPlayerCard(id) {
    const [card] = await db.select().from(playerCards).where((0, import_drizzle_orm4.eq)(playerCards.id, id));
    return card || void 0;
  }
  async getPlayerCardWithPlayer(id) {
    const [result] = await db.select().from(playerCards).innerJoin(players, (0, import_drizzle_orm4.eq)(playerCards.playerId, players.id)).where((0, import_drizzle_orm4.eq)(playerCards.id, id));
    if (!result) return void 0;
    return { ...result.player_cards, player: result.players };
  }
  async getUserCards(userId) {
    const results = await db.select().from(playerCards).innerJoin(players, (0, import_drizzle_orm4.eq)(playerCards.playerId, players.id)).where((0, import_drizzle_orm4.eq)(playerCards.ownerId, userId));
    return results.map((r) => ({ ...r.player_cards, player: r.players }));
  }
  async createPlayerCard(card) {
    const rarity = card.rarity || "common";
    const maxSupply = RARITY_SUPPLY[rarity] || 0;
    if (maxSupply > 0 && card.playerId) {
      const currentCount = await this.getSupplyCount(card.playerId, rarity);
      if (currentCount >= maxSupply) {
        throw new Error(`Supply cap reached for this player's ${rarity} cards (${maxSupply} max)`);
      }
    }
    const [created] = await db.insert(playerCards).values(card).returning();
    return created;
  }
  async updatePlayerCard(id, updates) {
    const [updated] = await db.update(playerCards).set(updates).where((0, import_drizzle_orm4.eq)(playerCards.id, id)).returning();
    return updated || void 0;
  }
  async getMarketplaceListings() {
    const results = await db.select().from(playerCards).innerJoin(players, (0, import_drizzle_orm4.eq)(playerCards.playerId, players.id)).where((0, import_drizzle_orm4.eq)(playerCards.forSale, true));
    return results.map((r) => ({ ...r.player_cards, player: r.players }));
  }
  async getWallet(userId) {
    const [w] = await db.select().from(wallets).where((0, import_drizzle_orm4.eq)(wallets.userId, userId));
    return w || void 0;
  }
  async createWallet(wallet) {
    const [created] = await db.insert(wallets).values(wallet).returning();
    return created;
  }
  async updateWalletBalance(userId, amount) {
    const [updated] = await db.update(wallets).set({ balance: import_drizzle_orm4.sql`${wallets.balance} + ${amount}` }).where((0, import_drizzle_orm4.eq)(wallets.userId, userId)).returning();
    return updated || void 0;
  }
  async updateWalletLockedBalance(userId, amount) {
    const [updated] = await db.update(wallets).set({ lockedBalance: import_drizzle_orm4.sql`${wallets.lockedBalance} + ${amount}` }).where((0, import_drizzle_orm4.eq)(wallets.userId, userId)).returning();
    return updated || void 0;
  }
  async lockFunds(userId, amount) {
    const [updated] = await db.update(wallets).set({
      balance: import_drizzle_orm4.sql`${wallets.balance} - ${amount}`,
      lockedBalance: import_drizzle_orm4.sql`${wallets.lockedBalance} + ${amount}`
    }).where((0, import_drizzle_orm4.eq)(wallets.userId, userId)).returning();
    return updated || void 0;
  }
  async unlockFunds(userId, amount) {
    const [updated] = await db.update(wallets).set({
      balance: import_drizzle_orm4.sql`${wallets.balance} + ${amount}`,
      lockedBalance: import_drizzle_orm4.sql`${wallets.lockedBalance} - ${amount}`
    }).where((0, import_drizzle_orm4.eq)(wallets.userId, userId)).returning();
    return updated || void 0;
  }
  async getTransactions(userId) {
    return db.select().from(transactions).where((0, import_drizzle_orm4.eq)(transactions.userId, userId)).orderBy((0, import_drizzle_orm4.desc)(transactions.createdAt));
  }
  async createTransaction(tx) {
    const [created] = await db.insert(transactions).values(tx).returning();
    return created;
  }
  async getLineup(userId) {
    const [l] = await db.select().from(lineups).where((0, import_drizzle_orm4.eq)(lineups.userId, userId));
    return l || void 0;
  }
  async createOrUpdateLineup(userId, cardIds, captainId) {
    const [existing] = await db.select().from(lineups).where((0, import_drizzle_orm4.eq)(lineups.userId, userId));
    if (existing) {
      const [updated] = await db.update(lineups).set({ cardIds, captainId, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm4.eq)(lineups.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(lineups).values({ userId, cardIds, captainId }).returning();
    return created;
  }
  async getOnboarding(userId) {
    const [o] = await db.select().from(userOnboarding).where((0, import_drizzle_orm4.eq)(userOnboarding.userId, userId));
    return o || void 0;
  }
  async createOnboarding(data) {
    const [created] = await db.insert(userOnboarding).values(data).returning();
    return created;
  }
  async updateOnboarding(userId, updates) {
    const [updated] = await db.update(userOnboarding).set(updates).where((0, import_drizzle_orm4.eq)(userOnboarding.userId, userId)).returning();
    return updated || void 0;
  }
  async getPlayerCount() {
    const [result] = await db.select({ count: import_drizzle_orm4.sql`count(*)` }).from(players);
    return result.count;
  }
  async getRandomPlayers(count) {
    return db.select().from(players).orderBy(import_drizzle_orm4.sql`RANDOM()`).limit(count);
  }
  async getRandomPlayersByPosition(position, count) {
    return db.select().from(players).where((0, import_drizzle_orm4.eq)(players.position, position)).orderBy(import_drizzle_orm4.sql`RANDOM()`).limit(count);
  }
  async getCompetitions() {
    return db.select().from(competitions).orderBy((0, import_drizzle_orm4.desc)(competitions.startTime));
  }
  async getCompetition(id) {
    const [comp] = await db.select().from(competitions).where((0, import_drizzle_orm4.eq)(competitions.id, id));
    return comp || void 0;
  }
  async createCompetition(comp) {
    const [created] = await db.insert(competitions).values(comp).returning();
    return created;
  }
  async updateCompetition(id, updates) {
    const [updated] = await db.update(competitions).set(updates).where((0, import_drizzle_orm4.eq)(competitions.id, id)).returning();
    return updated || void 0;
  }
  async getCompetitionEntries(competitionId) {
    return db.select().from(competitionEntries).where((0, import_drizzle_orm4.eq)(competitionEntries.competitionId, competitionId));
  }
  async getCompetitionEntry(competitionId, userId) {
    const [entry] = await db.select().from(competitionEntries).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(competitionEntries.competitionId, competitionId), (0, import_drizzle_orm4.eq)(competitionEntries.userId, userId)));
    return entry || void 0;
  }
  async createCompetitionEntry(entry) {
    const [created] = await db.insert(competitionEntries).values(entry).returning();
    return created;
  }
  async updateCompetitionEntry(id, updates) {
    const [updated] = await db.update(competitionEntries).set(updates).where((0, import_drizzle_orm4.eq)(competitionEntries.id, id)).returning();
    return updated || void 0;
  }
  async getUserCompetitions(userId) {
    return db.select().from(competitionEntries).where((0, import_drizzle_orm4.eq)(competitionEntries.userId, userId));
  }
  async getUserRewards(userId) {
    return db.select().from(competitionEntries).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(competitionEntries.userId, userId), import_drizzle_orm4.sql`${competitionEntries.rewardAmount} > 0`));
  }
  async getSwapOffer(id) {
    const [offer] = await db.select().from(swapOffers).where((0, import_drizzle_orm4.eq)(swapOffers.id, id));
    return offer || void 0;
  }
  async getSwapOffersForCard(cardId) {
    return db.select().from(swapOffers).where((0, import_drizzle_orm4.eq)(swapOffers.offeredCardId, cardId));
  }
  async getUserSwapOffers(userId) {
    return db.select().from(swapOffers).where((0, import_drizzle_orm4.eq)(swapOffers.senderId, userId));
  }
  async createSwapOffer(offer) {
    const [created] = await db.insert(swapOffers).values(offer).returning();
    return created;
  }
  async updateSwapOffer(id, updates) {
    const [updated] = await db.update(swapOffers).set(updates).where((0, import_drizzle_orm4.eq)(swapOffers.id, id)).returning();
    return updated || void 0;
  }
  async createWithdrawalRequest(req) {
    const [created] = await db.insert(withdrawalRequests).values(req).returning();
    return created;
  }
  async getUserWithdrawalRequests(userId) {
    return db.select().from(withdrawalRequests).where((0, import_drizzle_orm4.eq)(withdrawalRequests.userId, userId));
  }
  async getAllPendingWithdrawals() {
    return db.select().from(withdrawalRequests).where((0, import_drizzle_orm4.eq)(withdrawalRequests.status, "pending"));
  }
  async getAllWithdrawals() {
    return db.select().from(withdrawalRequests).orderBy((0, import_drizzle_orm4.desc)(withdrawalRequests.createdAt));
  }
  async updateWithdrawalRequest(id, updates) {
    const [updated] = await db.update(withdrawalRequests).set(updates).where((0, import_drizzle_orm4.eq)(withdrawalRequests.id, id)).returning();
    return updated || void 0;
  }
  async generateSerialId(playerId, playerName, rarity = "common") {
    const maxSupply = RARITY_SUPPLY[rarity] || 0;
    const currentCount = await this.getSupplyCount(playerId, rarity);
    const nextNumber = currentCount + 1;
    const initials = playerName.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 3);
    const serialId = `${initials}-${rarity[0].toUpperCase()}-${nextNumber.toString().padStart(4, "0")}`;
    return { serialId, serialNumber: nextNumber, maxSupply };
  }
  async getSupplyCount(playerId, rarity) {
    const [result] = await db.select({ count: import_drizzle_orm4.sql`count(*)` }).from(playerCards).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(playerCards.playerId, playerId), (0, import_drizzle_orm4.eq)(playerCards.rarity, rarity)));
    return result.count;
  }
  async backfillSerialIds() {
    const allCards = await db.select().from(playerCards);
    for (const card of allCards) {
      if (!card.serialId && card.playerId) {
        const [player] = await db.select().from(players).where((0, import_drizzle_orm4.eq)(players.id, card.playerId));
        if (player) {
          const { serialId, serialNumber } = await this.generateSerialId(player.id, player.name, card.rarity || "common");
          await db.update(playerCards).set({ serialId, serialNumber }).where((0, import_drizzle_orm4.eq)(playerCards.id, card.id));
        }
      }
    }
  }
};
var storage = new DatabaseStorage();

// server/replit_integrations/auth/replitAuth.ts
var client = __toESM(require("openid-client"));
var import_passport = require("openid-client/passport");
var import_passport2 = __toESM(require("passport"));
var import_express_session = __toESM(require("express-session"));
var import_memoizee = __toESM(require_memoizee());
var import_connect_pg_simple = __toESM(require("connect-pg-simple"));

// server/replit_integrations/auth/storage.ts
init_auth();
init_db();
var import_drizzle_orm5 = require("drizzle-orm");
var AuthStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where((0, import_drizzle_orm5.eq)(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
};
var authStorage = new AuthStorage();

// server/replit_integrations/auth/replitAuth.ts
var getOidcConfig = (0, import_memoizee.default)(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = (0, import_connect_pg_simple.default)(import_express_session.default);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return (0, import_express_session.default)({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(import_passport2.default.initialize());
  app2.use(import_passport2.default.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  const registeredStrategies = /* @__PURE__ */ new Set();
  const ensureStrategy = (domain) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new import_passport.Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`
        },
        verify
      );
      import_passport2.default.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };
  import_passport2.default.serializeUser((user, cb) => cb(null, user));
  import_passport2.default.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    import_passport2.default.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    import_passport2.default.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// server/replit_integrations/auth/routes.ts
function registerAuthRoutes(app2) {
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

// server/seed.ts
init_schema();
var seedPlayers = [
  { name: "Marcus Rashford", team: "Manchester United", league: "Premier League", position: "FWD", nationality: "England", age: 27, overall: 84, imageUrl: "/images/player-1.png" },
  { name: "Bruno Fernandes", team: "Manchester United", league: "Premier League", position: "MID", nationality: "Portugal", age: 30, overall: 88, imageUrl: "/images/player-2.png" },
  { name: "Virgil van Dijk", team: "Liverpool", league: "Premier League", position: "DEF", nationality: "Netherlands", age: 33, overall: 89, imageUrl: "/images/player-3.png" },
  { name: "Alisson Becker", team: "Liverpool", league: "Premier League", position: "GK", nationality: "Brazil", age: 31, overall: 89, imageUrl: "/images/player-4.png" },
  { name: "Bukayo Saka", team: "Arsenal", league: "Premier League", position: "FWD", nationality: "England", age: 23, overall: 87, imageUrl: "/images/player-5.png" },
  { name: "Kevin De Bruyne", team: "Manchester City", league: "Premier League", position: "MID", nationality: "Belgium", age: 33, overall: 91, imageUrl: "/images/player-6.png" },
  { name: "Erling Haaland", team: "Manchester City", league: "Premier League", position: "FWD", nationality: "Norway", age: 24, overall: 91, imageUrl: "/images/player-1.png" },
  { name: "Mohamed Salah", team: "Liverpool", league: "Premier League", position: "FWD", nationality: "Egypt", age: 32, overall: 89, imageUrl: "/images/player-5.png" },
  { name: "Phil Foden", team: "Manchester City", league: "Premier League", position: "MID", nationality: "England", age: 24, overall: 87, imageUrl: "/images/player-2.png" },
  { name: "Declan Rice", team: "Arsenal", league: "Premier League", position: "MID", nationality: "England", age: 26, overall: 86, imageUrl: "/images/player-6.png" },
  { name: "William Saliba", team: "Arsenal", league: "Premier League", position: "DEF", nationality: "France", age: 24, overall: 86, imageUrl: "/images/player-3.png" },
  { name: "Rodri", team: "Manchester City", league: "Premier League", position: "MID", nationality: "Spain", age: 28, overall: 90, imageUrl: "/images/player-6.png" },
  { name: "Jude Bellingham", team: "Real Madrid", league: "La Liga", position: "MID", nationality: "England", age: 21, overall: 89, imageUrl: "/images/player-2.png" },
  { name: "Vinicius Jr", team: "Real Madrid", league: "La Liga", position: "FWD", nationality: "Brazil", age: 24, overall: 90, imageUrl: "/images/player-5.png" },
  { name: "Kylian Mbappe", team: "Real Madrid", league: "La Liga", position: "FWD", nationality: "France", age: 26, overall: 92, imageUrl: "/images/player-1.png" },
  { name: "Lamine Yamal", team: "Barcelona", league: "La Liga", position: "FWD", nationality: "Spain", age: 17, overall: 83, imageUrl: "/images/player-5.png" },
  { name: "Pedri", team: "Barcelona", league: "La Liga", position: "MID", nationality: "Spain", age: 22, overall: 87, imageUrl: "/images/player-6.png" },
  { name: "Robert Lewandowski", team: "Barcelona", league: "La Liga", position: "FWD", nationality: "Poland", age: 36, overall: 88, imageUrl: "/images/player-1.png" },
  { name: "Thibaut Courtois", team: "Real Madrid", league: "La Liga", position: "GK", nationality: "Belgium", age: 32, overall: 89, imageUrl: "/images/player-4.png" },
  { name: "Antonio Rudiger", team: "Real Madrid", league: "La Liga", position: "DEF", nationality: "Germany", age: 31, overall: 85, imageUrl: "/images/player-3.png" },
  { name: "Florian Wirtz", team: "Bayer Leverkusen", league: "Bundesliga", position: "MID", nationality: "Germany", age: 21, overall: 87, imageUrl: "/images/player-2.png" },
  { name: "Harry Kane", team: "Bayern Munich", league: "Bundesliga", position: "FWD", nationality: "England", age: 31, overall: 90, imageUrl: "/images/player-1.png" },
  { name: "Jamal Musiala", team: "Bayern Munich", league: "Bundesliga", position: "MID", nationality: "Germany", age: 21, overall: 86, imageUrl: "/images/player-6.png" },
  { name: "Manuel Neuer", team: "Bayern Munich", league: "Bundesliga", position: "GK", nationality: "Germany", age: 38, overall: 86, imageUrl: "/images/player-4.png" },
  { name: "Lautaro Martinez", team: "Inter Milan", league: "Serie A", position: "FWD", nationality: "Argentina", age: 27, overall: 88, imageUrl: "/images/player-1.png" },
  { name: "Hakan Calhanoglu", team: "Inter Milan", league: "Serie A", position: "MID", nationality: "Turkey", age: 30, overall: 85, imageUrl: "/images/player-2.png" },
  { name: "Alessandro Bastoni", team: "Inter Milan", league: "Serie A", position: "DEF", nationality: "Italy", age: 25, overall: 86, imageUrl: "/images/player-3.png" }
];
var marketplaceCards = [
  { playerIndex: 14, rarity: "legendary", level: 5, price: 250, scores: [88, 92, 75, 95, 90] },
  { playerIndex: 6, rarity: "legendary", level: 4, price: 200, scores: [85, 90, 78, 88, 92] },
  { playerIndex: 5, rarity: "unique", level: 3, price: 120, scores: [72, 80, 85, 68, 77] },
  { playerIndex: 12, rarity: "unique", level: 3, price: 100, scores: [65, 78, 82, 70, 85] },
  { playerIndex: 13, rarity: "unique", level: 2, price: 90, scores: [70, 75, 60, 88, 72] },
  { playerIndex: 7, rarity: "rare", level: 2, price: 45, scores: [60, 72, 55, 80, 65] },
  { playerIndex: 1, rarity: "rare", level: 2, price: 35, scores: [55, 68, 72, 60, 58] },
  { playerIndex: 11, rarity: "rare", level: 1, price: 30, scores: [50, 62, 58, 70, 55] },
  { playerIndex: 21, rarity: "rare", level: 1, price: 28, scores: [58, 65, 48, 72, 60] },
  { playerIndex: 4, rarity: "rare", level: 1, price: 25, scores: [52, 60, 65, 55, 62] }
];
async function seedDatabase() {
  const count = await storage.getPlayerCount();
  if (count > 0) {
    console.log(`Database already has ${count} players, skipping seed`);
    await storage.backfillSerialIds();
    return;
  }
  console.log("Seeding database with players...");
  const createdPlayers = [];
  for (const player of seedPlayers) {
    const created = await storage.createPlayer(player);
    createdPlayers.push(created);
  }
  console.log(`Seeded ${seedPlayers.length} players`);
  console.log("Seeding marketplace listings...");
  for (const listing of marketplaceCards) {
    const player = createdPlayers[listing.playerIndex];
    if (player) {
      const supply = RARITY_SUPPLY[listing.rarity] || 0;
      if (supply > 0) {
        const currentCount = await storage.getSupplyCount(player.id, listing.rarity);
        if (currentCount >= supply) {
          console.log(`Supply cap reached for ${player.name} ${listing.rarity}, skipping`);
          continue;
        }
      }
      const { serialId, serialNumber, maxSupply } = await storage.generateSerialId(player.id, player.name, listing.rarity);
      const decisiveScore = Math.min(100, 35 + listing.level * 13);
      await storage.createPlayerCard({
        playerId: player.id,
        ownerId: null,
        rarity: listing.rarity,
        serialId,
        serialNumber,
        maxSupply,
        level: listing.level,
        xp: listing.level * 100,
        decisiveScore,
        last5Scores: listing.scores,
        forSale: true,
        price: listing.price
      });
    }
  }
  console.log(`Seeded ${marketplaceCards.length} marketplace listings`);
}
async function seedCompetitions() {
  const existing = await storage.getCompetitions();
  if (existing.length > 0) {
    console.log(`Already have ${existing.length} competitions, skipping seed`);
    return;
  }
  console.log("Seeding competitions...");
  const now = /* @__PURE__ */ new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  const nextWeekEnd = new Date(endOfWeek);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
  await storage.createCompetition({
    name: "Common Cup - GW1",
    tier: "common",
    entryFee: 0,
    status: "open",
    gameWeek: 1,
    startDate: now,
    endDate: endOfWeek,
    prizeCardRarity: "rare"
  });
  await storage.createCompetition({
    name: "Rare Championship - GW1",
    tier: "rare",
    entryFee: 20,
    status: "open",
    gameWeek: 1,
    startDate: now,
    endDate: endOfWeek,
    prizeCardRarity: "unique"
  });
  await storage.createCompetition({
    name: "Common Cup - GW2",
    tier: "common",
    entryFee: 0,
    status: "open",
    gameWeek: 2,
    startDate: endOfWeek,
    endDate: nextWeekEnd,
    prizeCardRarity: "rare"
  });
  await storage.createCompetition({
    name: "Rare Championship - GW2",
    tier: "rare",
    entryFee: 20,
    status: "open",
    gameWeek: 2,
    startDate: endOfWeek,
    endDate: nextWeekEnd,
    prizeCardRarity: "unique"
  });
  console.log("Seeded 4 competitions");
}

// server/routes.ts
var ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "").split(",").filter(Boolean);
function isAdmin(req, res, next) {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  const userId = user.claims?.sub || user.id;
  if (ADMIN_USER_IDS.length > 0 && !ADMIN_USER_IDS.includes(userId)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}
async function registerRoutes(httpServer2, app2) {
  if (process.env.REPL_ID) {
    await setupAuth(app2);
    registerAuthRoutes(app2);
  } else {
    console.log("Railway environment detected: Bypassing Replit Auth.");
    app2.use((req, _res, next) => {
      req.isAuthenticated = () => true;
      req.user = {
        id: "54644807",
        claims: { sub: "54644807" },
        firstName: "Zjondre",
        lastName: "Angermund"
      };
      next();
    });
    app2.get("/api/auth/user", (req, res) => res.json(req.user));
    app2.post("/api/auth/logout", (_req, res) => res.json({ success: true }));
  }
  app2.post("/api/epl/sync", async (_req, res) => {
    try {
      console.log("Starting Premier League data sync...");
      await seedDatabase();
      await seedCompetitions();
      res.json({ success: true, message: "Data synced successfully" });
    } catch (error) {
      console.error("Sync failed:", error);
      res.status(500).json({ message: "Failed to sync data", error: error.message });
    }
  });
  app2.get("/api/players", async (_req, res) => {
    try {
      const cards = await storage.getMarketplaceListings();
      res.json(cards);
    } catch (error) {
      console.error("Failed to fetch player cards:", error);
      res.status(500).json({ message: "Failed to fetch player cards" });
    }
  });
  app2.get("/api/user/cards", async (req, res) => {
    try {
      const userId = req.user?.id || "54644807";
      const cards = await storage.getUserCards(userId);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user cards" });
    }
  });
  app2.get("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.getPlayer(Number(req.params.id));
      if (!player) return res.status(404).json({ message: "Player not found" });
      res.json(player);
    } catch (error) {
      console.error("Error fetching player:", error);
      res.status(500).json({ message: "Error fetching player" });
    }
  });
  const { listCardForSale: listCardForSale2, buyCard: buyCard2, cancelListing: cancelListing2 } = await Promise.resolve().then(() => (init_marketplace(), marketplace_exports));
  app2.post("/api/marketplace/sell", async (req, res) => {
    try {
      const userId = req.user?.id || "54644807";
      const { cardId, price } = req.body;
      if (!cardId || !price) {
        return res.status(400).json({ message: "Card ID and price are required" });
      }
      const result = await listCardForSale2(userId, cardId, price);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      res.json({ success: true, message: "Card listed successfully" });
    } catch (error) {
      console.error("Error listing card:", error);
      res.status(500).json({ message: "Failed to list card" });
    }
  });
  app2.post("/api/marketplace/buy", async (req, res) => {
    try {
      const userId = req.user?.id || "54644807";
      const { cardId } = req.body;
      if (!cardId) {
        return res.status(400).json({ message: "Card ID is required" });
      }
      const result = await buyCard2(userId, cardId);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      res.json({
        success: true,
        message: "Card purchased successfully",
        totalCost: result.totalCost
      });
    } catch (error) {
      console.error("Error buying card:", error);
      res.status(500).json({ message: "Failed to buy card" });
    }
  });
  app2.post("/api/marketplace/cancel", async (req, res) => {
    try {
      const userId = req.user?.id || "54644807";
      const { cardId } = req.body;
      if (!cardId) {
        return res.status(400).json({ message: "Card ID is required" });
      }
      const result = await cancelListing2(userId, cardId);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      res.json({ success: true, message: "Listing cancelled" });
    } catch (error) {
      console.error("Error cancelling listing:", error);
      res.status(500).json({ message: "Failed to cancel listing" });
    }
  });
  const { settleCompetition: settleCompetition2, getCompetitionLeaderboard: getCompetitionLeaderboard2 } = await Promise.resolve().then(() => (init_competitions(), competitions_exports));
  app2.post("/api/competitions/settle", isAdmin, async (req, res) => {
    try {
      const { competitionId } = req.body;
      if (!competitionId) {
        return res.status(400).json({ message: "Competition ID is required" });
      }
      const result = await settleCompetition2(competitionId);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      res.json({ success: true, message: "Competition settled successfully" });
    } catch (error) {
      console.error("Error settling competition:", error);
      res.status(500).json({ message: "Failed to settle competition" });
    }
  });
  app2.get("/api/competitions/:id/leaderboard", async (req, res) => {
    try {
      const competitionId = Number(req.params.id);
      const leaderboard = await getCompetitionLeaderboard2(competitionId);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });
  const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const { notifications: notifications2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { eq: eq6, desc: desc4 } = await import("drizzle-orm");
  app2.get("/api/notifications", async (req, res) => {
    try {
      const userId = req.user?.id || "54644807";
      const userNotifications = await db2.select().from(notifications2).where(eq6(notifications2.userId, userId)).orderBy(desc4(notifications2.createdAt));
      res.json(userNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const notificationId = Number(req.params.id);
      await db2.update(notifications2).set({ isRead: true }).where(eq6(notifications2.id, notificationId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });
  app2.post("/api/notifications/read-all", async (req, res) => {
    try {
      const userId = req.user?.id || "54644807";
      await db2.update(notifications2).set({ isRead: true }).where(eq6(notifications2.userId, userId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to update notifications" });
    }
  });
  const {
    getLeagueStandings: getLeagueStandings2,
    getPlayerScores: getPlayerScores2,
    getInjuries: getInjuries2
  } = await Promise.resolve().then(() => (init_fantasyLeagueApi(), fantasyLeagueApi_exports));
  app2.get("/api/fantasy/standings", async (_req, res) => {
    try {
      const standings = await getLeagueStandings2();
      res.json(standings);
    } catch (error) {
      console.error("Error fetching standings:", error);
      res.status(500).json({ message: "Failed to fetch standings" });
    }
  });
  app2.get("/api/fantasy/scores", async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 20;
      const scores = await getPlayerScores2(limit);
      res.json(scores);
    } catch (error) {
      console.error("Error fetching scores:", error);
      res.status(500).json({ message: "Failed to fetch scores" });
    }
  });
  app2.get("/api/fantasy/injuries", async (_req, res) => {
    try {
      const injuries = await getInjuries2();
      res.json(injuries);
    } catch (error) {
      console.error("Error fetching injuries:", error);
      res.status(500).json({ message: "Failed to fetch injuries" });
    }
  });
  return httpServer2;
}

// server/static.ts
var import_express = __toESM(require("express"));
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
function serveStatic(app2) {
  const distPath = import_path.default.resolve(process.cwd(), "dist", "public");
  console.log(`Checking for build directory at: ${distPath}`);
  if (!import_fs.default.existsSync(distPath)) {
    const fallbackPath = import_path.default.resolve(process.cwd(), "public");
    if (import_fs.default.existsSync(import_path.default.resolve(fallbackPath, "index.html"))) {
      console.log(`Found build at fallback: ${fallbackPath}`);
      app2.use(import_express.default.static(fallbackPath));
      app2.get("/*splat", (_req, res) => res.sendFile(import_path.default.resolve(fallbackPath, "index.html")));
      return;
    }
    throw new Error(`Could not find the build directory: ${distPath}. Build artifacts missing.`);
  }
  app2.use(import_express.default.static(distPath));
  app2.get("/*splat", (_req, res) => res.sendFile(import_path.default.resolve(distPath, "index.html")));
}

// server/index.ts
var import_http = require("http");
var app = (0, import_express2.default)();
var httpServer = (0, import_http.createServer)(app);
app.use(
  import_express2.default.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(import_express2.default.urlencoded({ extended: false }));
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  await registerRoutes(httpServer, app);
  app.use((err, _req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  log
});
