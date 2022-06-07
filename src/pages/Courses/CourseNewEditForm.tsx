import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useMemo } from 'react';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { TCourse } from 'types/course';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { PATH_DASHBOARD } from 'routes/paths';
import {
  Autocomplete,
  Button,
  Card,
  Chip,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  styled,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import { isBefore } from 'date-fns';
import {
  RHFTextField,
  FormProvider,
  RHFEditor,
  RHFUploadMultiFile,
  RHFSwitch,
  RHFRadioGroup,
  RHFSelect,
  RHFUploadSingleFile,
} from 'components/hook-form';
import { LoadingButton, MobileDateTimePicker, DateTimePicker } from '@mui/lab';
import ModalSubjectForm from './components/ModalSubjectForm';
import useLocales from 'hooks/useLocales';
import { useQuery } from 'react-query';
import subjectApi from 'apis/subject';
import { AutoCompleteField, SelectField } from 'components/form';
import request from 'utils/axios';
import Page from 'components/Page';
import HeaderBreadcrumbs from 'components/HeaderBreadcrumbs';

// ----------------------------------------------------------------------

const GENDER_OPTION = [
  { label: 'Men', value: 'Men' },
  { label: 'Women', value: 'Women' },
  { label: 'Kids', value: 'Kids' },
];

const CATEGORY_OPTION = [
  { group: 'Clothing', classify: ['Shirts', 'T-shirts', 'Jeans', 'Leather'] },
  { group: 'Tailored', classify: ['Suits', 'Blazers', 'Trousers', 'Waistcoats'] },
  { group: 'Accessories', classify: ['Shoes', 'Backpacks and bags', 'Bracelets', 'Face masks'] },
];

const SUBJECT = [
  {
    id: 1,
    name: 'Khoa',
  },
  {
    id: 2,
    name: 'Thao',
  },
];

const TAGS_OPTION = [
  'Toy Story 3',
  'Logan',
  'Full Metal Jacket',
  'Dangal',
  'The Sting',
  '2001: A Space Odyssey',
  "Singin' in the Rain",
  'Toy Story',
  'Bicycle Thieves',
  'The Kid',
  'Inglourious Basterds',
  'Snatch',
  '3 Idiots',
];

const CardTitle = styled(Typography)({
  display: 'inline-block',
  textAlign: 'left',
  marginBottom: '0px',
  fontSize: '24px',
});

const MIN_QUANTITY = [1, 2, 3, 4, 5];
const MAX_QUANTITY = [1, 2, 3, 4, 5];

const LabelStyle = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

type Props = {
  isEdit: boolean;
  currentCourse?: TCourse;
};

function CourseNewEditForm({ isEdit, currentCourse }: Props) {
  const navigate = useNavigate();

  const { translate } = useLocales();

  const { enqueueSnackbar } = useSnackbar();

  const schema = yup.object().shape({
    name: yup.string().required('Name is required'),
    minQuantity: yup.number().required('Min quantity is required.'),
    maxQuantity: yup
      .number()
      .required('Max quantity is required.')
      .when('minQuantity', (minQuantity, maxQuantity): any => {
        if (Number(maxQuantity) < Number(minQuantity)) {
          return yup.string().required('Max must be larger than Min');
        }
      }),
    // description: yup.string().required('Description is required'),
    // images: yup.array().min(1, 'Images is required'),
    // price: yup.number().moreThan(0, 'Price should not be $0.00'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentCourse?.name || '',
      // minQuantity: currentCourse?.minQuantity || 0,
      // maxQuantity: currentCourse?.maxQuantity || 0,
      //   description: currentCourse?.description || '',
      //   images: currentCourse?.images || [],
      //   code: currentCourse?.code || '',
      //   sku: currentCourse?.sku || '',
      //   price: currentCourse?.price || 0,
      //   priceSale: currentCourse?.priceSale || 0,
      //   tags: currentCourse?.tags || [TAGS_OPTION[0]],
      //   inStock: true,
      //   taxes: true,
      //   gender: currentCourse?.gender || GENDER_OPTION[2].value,
      //   category: currentCourse?.category || CATEGORY_OPTION[0].classify[1],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentCourse]
  );

  const methods = useForm<TCourse>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const isDateError = isBefore(new Date(values.finishDate), new Date(values.startDate));
  const products = watch('name');
  const setProducts = (products: any) => {
    setValue('name', products);
  };

  const { data, isLoading } = useQuery('subjectForCourse', () =>
    request.get('/subjects').then((res) => res?.data.data)
  );
  const subjectOptions = data?.map((c: any) => ({ label: c.name, value: c.id }));
  const getSubject = (option: any) => {
    if (!option) return option;
    if (!option.value) return subjectOptions.find((opt: any) => opt.value === option);
    return option;
  };

  useEffect(() => {
    if (isEdit && currentCourse) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentCourse]);

  const onSubmit = async (data: TCourse) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      console.log(data);
      navigate(PATH_DASHBOARD.courses.list);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        setValue(
          'imageUrl',
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );
      }
    },
    [setValue]
  );

  const handleRemoveAll = () => {
    setValue('imageUrl', []);
  };

  const handleRemove = (file: File | string) => {
    const filteredItems = values.imageUrl?.filter((_file) => _file !== file);
    setValue('imageUrl', filteredItems);
  };

  return (
    <>
      <Page
        title={`Khoá học`}
        isTable
        content={
          <HeaderBreadcrumbs
            heading=""
            links={[
              { name: `${translate('dashboard')}`, href: PATH_DASHBOARD.root },
              {
                name: `Khoá học`,
                href: PATH_DASHBOARD.courses.root,
              },
              { name: `Tạo khoá học` },
            ]}
          />
        }
      >
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <RHFTextField name="name" label="Tên khoá học" />

                  <AutoCompleteField
                    options={subjectOptions}
                    getOptionLabel={(value: any) => getSubject(value)?.label || ''}
                    isOptionEqualToValue={(option: any, value: any) => {
                      if (!option) return option;
                      return option.value === getSubject(value)?.value;
                    }}
                    transformValue={(opt: any) => opt?.value}
                    size="large"
                    type="text"
                    label={'Chọn môn học'}
                    name="subjectId"
                    fullWidth
                  />

                  <Grid xs={12} display="flex">
                    <AutoCompleteField
                      disabled={false}
                      options={['A', 'B']}
                      name="mentorId"
                      size="large"
                      type="text"
                      label="Giảng viên"
                      fullWidth
                    />
                    <Divider variant="middle" />
                    <AutoCompleteField
                      disabled={false}
                      options={['Online', 'Offline']}
                      name=""
                      size="large"
                      type="text"
                      label="Hình thức giảng dạy"
                      fullWidth
                    />
                  </Grid>

                  <div>
                    <LabelStyle>Description</LabelStyle>
                    <RHFEditor simple name="description" />
                  </div>

                  <div>
                    <LabelStyle>Images</LabelStyle>
                    <RHFUploadSingleFile
                      name="cover"
                      accept="image/*"
                      maxSize={3145728}
                      onDrop={handleDrop}
                    />
                  </div>
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <Card sx={{ p: 3 }}>
                  {/* <RHFSwitch name="inStock" label="In stock" /> */}

                  <RHFTextField name="location" label="Địa chỉ" sx={{ pb: 3 }} />

                  <RHFTextField name="slug" label="Slug" sx={{ pb: 3 }} />

                  <Grid xs={12} display="flex">
                    <Grid xs={12}>
                      <AutoCompleteField
                        disabled={false}
                        options={[1, 2, 3, 4, 5, 6]}
                        name="minQuantity"
                        size="large"
                        type="text"
                        label="Số học viên tối thiểu"
                        fullWidth
                      />
                    </Grid>

                    <Divider variant="middle" />

                    <Grid xs={12}>
                      <AutoCompleteField
                        disabled={false}
                        options={[1, 2, 3, 4, 5, 6]}
                        name="maxQuantity"
                        size="large"
                        type="text"
                        label="Số học viên tối đa"
                        fullWidth
                      />
                    </Grid>
                  </Grid>

                  <Stack spacing={3} mt={2}>
                    {/* <RHFTextField name="code" label="Product Code" /> */}

                    {/* <RHFTextField name="sku" label="Product SKU" /> */}

                    {/* <div>
                  <LabelStyle>Gender</LabelStyle>
                  <RHFRadioGroup
                    name="gender"
                    options={GENDER_OPTION}
                    sx={{
                      '& .MuiFormControlLabel-root': { mr: 4 },
                    }}
                  />
                </div> */}

                    {/* <RHFSelect name="category" label="Category">
                  {CATEGORY_OPTION.map((category) => (
                    <optgroup key={category.group} label={category.group}>
                      {category.classify.map((classify) => (
                        <option key={classify} value={classify}>
                          {classify}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </RHFSelect> */}

                    <Grid xs={12}>
                      <Controller
                        name="startDate"
                        control={control}
                        render={({ field }) => (
                          <DateTimePicker
                            {...field}
                            label="Ngày bắt đầu"
                            inputFormat="dd/MM/yyyy hh:mm a"
                            renderInput={(params) => <TextField {...params} fullWidth />}
                          />
                        )}
                      />
                    </Grid>

                    <Grid xs={12}>
                      <Controller
                        name="finishDate"
                        control={control}
                        render={({ field }) => (
                          <DateTimePicker
                            {...field}
                            label="Ngày kết thúc"
                            inputFormat="dd/MM/yyyy hh:mm a"
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                fullWidth
                                error={!!isDateError}
                                helperText={
                                  isDateError && 'Ngày kết thúc phải lớn hơn ngày bắt đầu'
                                }
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>

                    <RHFTextField
                      size="medium"
                      type="number"
                      name="price"
                      label="Giá"
                      onChange={(event) => setValue(`price`, event.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />

                    {/* <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  options={MIN_QUANTITY}
                  sx={{ width: 300 }}
                  renderInput={(params) => <TextField {...params} label="Số lượng tối đa" />}
                /> */}

                    {/* <SelectField
                  key={'min_quantity'}
                  label={'Số lượng tối thiểu'}
                  name={'minQuantity'}
                  size={'large'}
                >
                  {MIN_QUANTITY?.map((idx) => (
                    <MenuItem value={Number(idx)} key={`min_quantity_${idx}`}>
                      {Number(idx)}
                    </MenuItem>
                  ))}
                </SelectField>

                <SelectField
                  key={'max_quantity'}
                  label={'Số lượng tối đa'}
                  name={'maxQuantity'}
                  size={'large'}
                >
                  {MIN_QUANTITY?.map((idx) => (
                    <MenuItem value={Number(idx)} key={`max_quantity_${idx}`}>
                      {Number(idx)}
                    </MenuItem>
                  ))}
                </SelectField> */}

                    {/* <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      multiple
                      freeSolo
                      onChange={(event, newValue) => field.onChange(newValue)}
                      options={TAGS_OPTION.map((option) => option)}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option}
                            size="small"
                            label={option}
                          />
                        ))
                      }
                      renderInput={(params) => <TextField label="Tags" {...params} />}
                    />
                  )}
                /> */}
                  </Stack>
                </Card>

                {/* <Card sx={{ p: 3 }}>
              <Stack spacing={3} mb={2}>
                <RHFTextField
                  name="price"
                  label="Regular Price"
                  placeholder="0.00"
                  value={getValues('price') === 0 ? '' : getValues('price')}
                  onChange={(event) => setValue('price', Number(event.target.value))}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    type: 'number',
                  }}
                />

                <RHFTextField
                  name="priceSale"
                  label="Sale Price"
                  placeholder="0.00"
                  value={getValues('priceSale') === 0 ? '' : getValues('priceSale')}
                  onChange={(event) => setValue('price', Number(event.target.value))}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    type: 'number',
                  }}
                />
              </Stack>

              <RHFSwitch name="taxes" label="Price includes taxes" />
            </Card> */}

                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="large"
                  loading={isSubmitting}
                >
                  {!isEdit ? 'Tạo môn học' : 'Lưu thay đổi'}
                </LoadingButton>
              </Stack>
            </Grid>
          </Grid>
        </FormProvider>
      </Page>
    </>
  );
}

export default CourseNewEditForm;
