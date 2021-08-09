CREATE TABLE Refunds(
    
    pay_type varChar(15) NOT NULL,
    title varChar(10) NOT NULL,
    first_name varChar(50) NOT NULL,
    last_name varChar(50) NOT NULL,
    student_number char(7) NOT NULL,
    
    payer_title varChar(10),
    payer_first_name varChar(50),
    payer_last_name varChar(50),
    payer_address text,

    acc_name_it varChar(50),
    acc_iban_it varChar(15),
    acc_swift_it varChar(15),
    acc_bank_name_it varChar(30),
    acc_bank_address_it text,

    acc_name_ht varChar(50),
    acc_num_ht char(8),
    acc_sort_code char(9),

    ref_reason text,
    visa_ref bit,
    visa_ref_file image,
    ref_ex_reason text,
    tcs_accepted  bit DEFAULT 1,

    int_accept bit,
    int_dec_date date,
    int_rej_reason text,
    fi_accept bit,
    fi_dec_date date,
    fi_rej_reason text,

);

 