<?php

class DataFormField
{
    /**
     * Field type. Must be a member of FORM_FIELD_TYPE
     *
     * @var string
     */
    public $FieldType;

    /**
     * Field name
     *
     * @var string
     */
    public $Name;

    /**
     * Field title as it will appear on the form
     *
     * @var string
     */
    public $Title;

    /**
     * Default value
     *
     * @var string
     */
    public $DefaultValue;

    /**
     * Allow multiple choice for list element
     *
     * @var boolean
     */
    public $AllowMultipleChoice;

    /**
     * Current value.
     *
     * @var string
     * @deprecated Since we are now returning flat arrays on form submittion, this is not currently used.
     */
    public $Value;

    /**
     * Either field must be filled by the user.
     *
     * @var bool
     */
    public $IsRequired;

    /**
     * Inline help that will appear as yellow hint after the field
     *
     * @var string
     */
    public $Hint;

    /**
     * Only applicable if FormFieldType is FORM_FIELD_TYPE::SELECT
     *
     * @var array Flat key=>value array.
     */
    public $Options;

    /**
     * Constructor. By passing needed values in constructor, you can quickly contruct instances of FormField in one line of code.
     *
     * @param string $name Field name
     * @param string $field_type Field type. Must be a member of FORM_FIELD_TYPE
     * @param string $title Field title as it will appear on the form
     * @param bool $isrequired Either field must be filled by the user.
     * @param array $options Flat key=>value array to draw SELECT HTML control values. Only applicable if FormFieldType is FORM_FIELD_TYPE::SELECT
     * @param string $default_value Default value that will be in the field when form is drawn.
     * @param string $value Filed Value. The same as default_value
     * @param string $hint  Inline help that will appear as yellow hint after the field.
     */
    public function __construct($name, $field_type, $title, $isrequired = false, $options = array(),
                                $default_value = null, $value = null, $hint = null, $allow_multiple_choice = false)
    {
        // Defalts if we blindly pass nullz
        if ($options == null)
            $options = array();

        if ($isrequired == null)
            $isrequired = false;

        // Validation
        // type
        $Reflect = new ReflectionClass("FORM_FIELD_TYPE");
        if (!$Reflect->hasConstant(strtoupper($field_type)))
            throw new Exception("field_type must be of type FORM_FIELD_TYPE");

        $this->Name = $name;

        $this->FieldType = $field_type;
        $this->Title = $title;
        $this->DefaultValue = $default_value;

        if ($allow_multiple_choice)
            $this->Value = explode(",", $value);
        else
            $this->Value = $value;

        $this->IsRequired = $isrequired;
        $this->Hint = $hint;
        $this->Options = $options;
        $this->AllowMultipleChoice = $allow_multiple_choice;
    }
}
