import ajvLocalizeZh from 'ajv-i18n/localize/zh'
import { DeepPartial, UseFormSetError } from 'react-hook-form'

import type { CopilotDocV1 } from 'models/copilot.schema'

import { copilotSchemaValidator } from '../../models/copilot.schema.validator'

export function validateOperation(
  operation: DeepPartial<CopilotDocV1.OperationSnakeCased>,
  setError: UseFormSetError<CopilotDocV1.Operation>,
): boolean {
  const emptyGroup = operation.groups?.find(
    (group) => (group?.opers?.length || 0) === 0,
  )

  if (emptyGroup) {
    setError('global' as any, {
      message: `干员组“${emptyGroup.name}”不能为空`,
    })
    return false
  }

  // force details to exist to bypass ajv's required check - we can patch it later,
  // don't be so strict right now!
  operation = {
    ...operation,
    doc: {
      ...operation.doc,
      details: operation.doc?.details || 'dummy',
    },
  }

  const jsonSchemaValidation = copilotSchemaValidator.validate(
    'copilot',
    operation,
  )
  console.log(
    'jsonSchemaValidationResult',
    jsonSchemaValidation,
    'errors',
    copilotSchemaValidator.errors,
  )

  if (!jsonSchemaValidation && copilotSchemaValidator.errors) {
    ajvLocalizeZh(copilotSchemaValidator.errors)
    setError('global' as any, {
      message: copilotSchemaValidator.errorsText(undefined, {
        separator: '\n',
      }),
    })
    return false
  }

  return true
}
